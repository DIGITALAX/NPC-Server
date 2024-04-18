import { DynamicObject, GameEngine, PhysicsEngine } from "lance-gg";
import { SCENE_LIST } from "./../lib/constants.js";
import {
  between,
  degToRad,
  distanceBetween,
  radToDeg,
} from "./../lib/utils.js";
import { Direccion, Seat } from "./../types/src.types.js";
import * as socketIo from "socket.io";
import Vector2 from "./Vector2.js";
import GameTimer from "./GameTimer.js";

export default class RandomWalkerNPC extends DynamicObject<
  GameEngine<PhysicsEngine>,
  PhysicsEngine
> {
  private io: socketIo.Server;
  private direction!: Vector2;
  private speed: number = 60;
  private npc!: {
    x: number;
    y: number;
    displayWidth: number;
    displayHeight: number;
    texture: string;
  };
  private lastPositionCheckTime: number = 0;
  private idleProbability: number = 0.3;
  private lastIdleTime: number = 0;
  private previousPosition: Vector2;
  private lastDirection: Direccion | null = null;
  private idle: boolean;
  private moveCounter: number = 0;
  private sitting: boolean;
  private gameTimer: GameTimer;
  private randomSeat: Seat | null = null;
  private seats: Seat[];
  private avoid: {
    x: number;
    y: number;
    displayHeight: number;
    displayWidth: number;
  }[];

  constructor(
    sceneIndex: number,
    spriteIndex: number,
    io: socketIo.Server,
    gameEngine: GameEngine<PhysicsEngine>
  ) {
    super(gameEngine, {}, {});
    this.gameTimer = new GameTimer();
    this.idle = false;
    this.sitting = false;
    this.io = io;
    this.seats = SCENE_LIST[sceneIndex].seats;
    this.avoid = SCENE_LIST[sceneIndex].avoid;
    this.lastDirection;
    this.previousPosition = new Vector2(
      SCENE_LIST[sceneIndex].sprite[spriteIndex].x,
      SCENE_LIST[sceneIndex].sprite[spriteIndex].y
    );
    this.npc = {
      texture: SCENE_LIST[sceneIndex].sprite[spriteIndex].texture,
      x: SCENE_LIST[sceneIndex].sprite[spriteIndex].x,
      y: SCENE_LIST[sceneIndex].sprite[spriteIndex].y,
      displayWidth: SCENE_LIST[sceneIndex].sprite[spriteIndex].displayWidth,
      displayHeight: SCENE_LIST[sceneIndex].sprite[spriteIndex].displayHeight,
    };
    console.log("here");
    this.comprobarBordesDelMundo();
    this.recibirDireccion();
    this.setRandomDirection();
  }

  private setRandomDirection() {
    console.log("random");
    if (
      Date.now() > this.lastIdleTime + 30000 ||
      Math.random() < this.idleProbability
    ) {
      console.log("idle");
      this.goIdle();
    } else if (++this.moveCounter >= between(7, 13)) {
      console.log("sit");
      this.goSit();
    } else {
      this.goMove();
    }
  }

  syncTo(other: RandomWalkerNPC) {
    super.syncTo(other);
    this.position.copy(other.position);
    this.velocity.copy(other.velocity);
  }

  tick() {
    if (!this.idle) {
      this.willCollide();
      if (!this.sitting) {
        this.actualizarAnimacion();
        this.comprobarUbicacion();
      }
    }
    this.gameTimer.tick();
  }

  private actualizarAnimacion() {
    const dx = this.direction.x;
    const dy = this.direction.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    let direccion: Direccion | null = null;
    if (Math.abs(absX - absY) <= Math.max(absX, absY) * 0.3) {
      if (dx > 0 && dy > 0) {
        direccion = Direccion.DerechaAbajo;
      } else if (dx > 0 && dy < 0) {
        direccion = Direccion.DerechaArriba;
      } else if (dx < 0 && dy > 0) {
        direccion = Direccion.IzquierdaAbajo;
      } else if (dx < 0 && dy < 0) {
        direccion = Direccion.IzquierdaArriba;
      }
    } else if (absX > absY) {
      direccion = dx > 0 ? Direccion.Derecha : Direccion.Izquierda;
    } else {
      direccion = dy > 0 ? Direccion.Abajo : Direccion.Arriba;
    }

    this.io.emit("direccionCambio", {
      direccionX: this.direction.x,
      direccionY: this.direction.y,
      textura: this.npc.texture,
      direccion: direccion,
    });
  }

  private recibirDireccion() {
    this.io.on("recibirDireccion", () => {
      this.setRandomDirection();
    });
  }

  private willCollide() {
    let npcMiddleX = this.npc.x;
    let npcMiddleY = this.npc.y;
    let npcTopY = this.npc.y - this.npc.displayHeight / 2;
    let npcBottomY = this.npc.y + this.npc.displayHeight / 2;
    let npcLeftX = this.npc.x - this.npc.displayWidth / 2;
    let npcRightX = this.npc.x + this.npc.displayWidth / 2;
    let blockedDirections: Direccion[] = [];

    this.avoid.forEach((obstacle) => {
      let obstacleMiddleY = obstacle.y - obstacle.displayHeight / 2;
      let obstacleTopY = obstacle.y - obstacle.displayHeight;
      let obstacleLeftX = obstacle.x - obstacle.displayWidth;
      let obstacleBottomY = obstacle.y;
      let obstacleRightX = obstacle.x;

      if (Math.abs(npcMiddleY - obstacleMiddleY) < this.npc.displayHeight / 2) {
        if (npcRightX >= obstacleLeftX && npcLeftX < obstacleLeftX) {
          blockedDirections.push(Direccion.Derecha);
        }
        if (npcLeftX <= obstacleRightX && npcRightX > obstacleRightX) {
          blockedDirections.push(Direccion.Izquierda);
        }
        if (npcTopY < obstacleBottomY && npcBottomY > obstacleTopY) {
          if (npcMiddleX >= obstacleLeftX && npcMiddleX < obstacleRightX) {
            if (npcBottomY > obstacleTopY) {
              blockedDirections.push(Direccion.Abajo);
            }
            if (npcTopY < obstacleBottomY) {
              blockedDirections.push(Direccion.Arriba);
            }
          }
        }
      }
    });

    if (blockedDirections.length > 0) {
      if (this.sitting) {
        this.adjustPathTowardsChair(blockedDirections);
      } else {
        let availableDirections = Object.values(Direccion).filter(
          (dir) => !blockedDirections.includes(dir)
        );

        if (availableDirections.includes(this.lastDirection!)) {
          this.updateDirection(this.lastDirection, blockedDirections);
        } else {
          let newDirection =
            availableDirections.length > 0 ? availableDirections[0] : null;
          this.lastDirection = newDirection;
          this.updateDirection(newDirection, blockedDirections);
        }
      }
    }
  }

  private adjustPathTowardsChair(blockedDirections: Direccion[]) {
    const increment = 5;
    const maxAttempts = 36;
    let adjustedAngle = radToDeg(
      Math.atan2(
        Number(this.randomSeat?.adjustedY) - this.npc.y,
        Number(this.randomSeat?.adjustedX) - this.npc.x
      )
    );

    for (let i = 0; i < maxAttempts; i++) {
      if (i > 0) {
        adjustedAngle =
          (adjustedAngle +
            (i % 2 == 0 ? 1 : -1) * increment * (Math.floor(i / 2) + 1)) %
          360;
      }

      this.direction = new Vector2(
        Math.cos(degToRad(adjustedAngle)),
        Math.sin(degToRad(adjustedAngle))
      ).scale(this.speed);

      if (!this.isDirectionBlocked(this.direction, blockedDirections)) {
        this.actualizarAnimacion();
        break;
      }
    }
  }

  private isDirectionBlocked(
    vector: Vector2,
    blockedDirections: Direccion[]
  ): boolean {
    let predominantDirection: Direccion;
    if (Math.abs(vector.x) > Math.abs(vector.y)) {
      predominantDirection =
        vector.x > 0 ? Direccion.Derecha : Direccion.Izquierda;
    } else {
      predominantDirection = vector.y > 0 ? Direccion.Abajo : Direccion.Arriba;
    }

    return blockedDirections.includes(predominantDirection);
  }

  private attemptToFindPath(
    targetAngle: number,
    blockedDirections: Direccion[]
  ) {
    const increment = 5;
    for (let i = 0; i < 360 / increment; i++) {
      let angle = (targetAngle + i * increment) % 360;
      let dirVector = new Vector2(
        Math.cos(degToRad(angle)),
        Math.sin(degToRad(angle))
      ).scale(this.speed);
      if (!this.isDirectionBlocked(dirVector, blockedDirections)) {
        this.direction = this.direction;
        this.actualizarAnimacion();
        return;
      }
    }
  }

  private updateDirection(
    direction: Direccion | null,
    blockedDirections: Direccion[]
  ) {
    if (!direction) {
      let targetAngle =
        this.sitting && this.randomSeat
          ? radToDeg(
              Math.atan2(
                this.randomSeat.adjustedY - this.npc.y,
                this.randomSeat.adjustedX - this.npc.x
              )
            )
          : between(0, 360);
      this.attemptToFindPath(targetAngle, blockedDirections);
      return;
    } else {
      let angle;
      switch (direction) {
        case Direccion.Arriba:
          angle = -90;
          break;
        case Direccion.Abajo:
          angle = 90;
          break;
        case Direccion.Izquierda:
          angle = 180;
          break;
        default:
          angle = 0;
          break;
      }
      this.direction = new Vector2(
        Math.cos(degToRad(angle)),
        Math.sin(degToRad(angle))
      ).scale(this.speed);
      this.actualizarAnimacion();
    }
  }

  private goIdle() {
    this.idle = true;
    console.log("idle emit");
    const numero = between(5000, 20000);
    this.io.emit("goIdle", {
      between: numero,
      texture: this.npc.texture,
    });
    this.gameTimer.setTimeout(() => {
      this.lastIdleTime = Date.now();
      this.idle = false;
    }, numero);
  }

  private goMove() {
    console.log("move move");
    this.moveCounter++;
    const angle = between(0, 360);
    this.direction = new Vector2(Math.cos(angle), Math.sin(angle)).scale(
      this.speed
    );
    this.actualizarAnimacion();
  }

  private comprobarUbicacion() {
    if (Date.now() > this.lastPositionCheckTime + 15000) {
      const distance = distanceBetween(
        this.npc.x,
        this.npc.y,
        this.previousPosition.x,
        this.previousPosition.y
      );
      if (distance < 50) {
        this.setRandomDirection();
      }
      this.previousPosition.set(this.npc.x, this.npc.y);
      this.lastPositionCheckTime = Date.now();
    }
  }

  private comprobarBordesDelMundo() {
    this.io.on(
      "blocked",
      (data: {
        blockedRight: boolean;
        blockedLeft: boolean;
        blockedUp: boolean;
        blockedDown: boolean;
      }) => {
        if (!this.idle && !this.sitting) {
          if (
            data.blockedRight ||
            data.blockedLeft ||
            data.blockedUp ||
            data.blockedDown
          ) {
            let newAngle = 0;
            if (data.blockedRight) newAngle = between(90, 270);
            else if (data.blockedLeft) newAngle = between(-90, 90);
            if (data.blockedDown) newAngle = between(180, 360);
            else if (data.blockedUp) newAngle = between(0, 180);
            this.direction = new Vector2(
              Math.cos(degToRad(newAngle)),
              Math.sin(degToRad(newAngle))
            ).scale(this.speed);

            this.actualizarAnimacion();
          }
        }
      }
    );
  }

  private goSit() {
    this.sitting = true;
    this.randomSeat = this.seats[between(0, this.seats.length - 1)];
    const dx = this.randomSeat.adjustedX - this.npc.x;
    const dy = this.randomSeat.adjustedY - this.npc.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const duration = (distance / this.speed) * 1000;

    const angle = Math.atan2(dy, dx);
    this.direction = new Vector2(Math.cos(angle), Math.sin(angle)).scale(
      this.speed
    );

    const originalDepth = this.randomSeat.depthCount;
    const numero = between(15000, 30000);
    this.io.emit("goSit", {
      randomSeat: this.randomSeat,
      duration,
      numeroBetween: numero,
      originalDepth: originalDepth,
      texture: this.npc.texture,
      direccionX: this.direction.x,
      direccionY: this.direction.y,
      speed: this.speed,
    });

    this.gameTimer.setTimeout(() => {
      this.sitting = false;
      this.randomSeat = null;
      this.moveCounter = 0;
    }, numero);
  }
}
