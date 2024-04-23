import { between, degToRad } from "./../lib/utils.js";
import { Direccion, Sprite, Objeto, Seat } from "./../types/src.types.js";
import Vector2 from "./Vector2.js";
import GameTimer from "./GameTimer.js";

export default class RandomWalkerNPC {
  private readonly world: {
    height: number;
    width: number;
  };
  private readonly seats: Seat[];
  private readonly avoidAll: (Objeto & {
    left: number;
    top: number;
    right: number;
    bottom: number;
  })[];
  private readonly avoidFlex: (Objeto & {
    left: number;
    top: number;
    right: number;
    bottom: number;
  })[];
  private readonly speed: number = 60;
  private readonly directionChangeMinInterval: number = 1000;
  private directionChangeCooldown: number = 0;
  private velocidad!: Vector2;
  private animacion: Direccion | null = null;
  private npc!: Sprite;
  private seatsTaken: number;
  private ultimoDirecciones: Direccion[] = [];
  private lastPositionCheckTime: number = 0;
  private idleProbability: number = 0.3;
  private lastIdleTime: number = 0;
  private moveCounter: number = 0;
  private sitting: boolean;
  private gameTimer: GameTimer;
  private randomSeat: Seat | null = null;
  private lastVisitedRegion: number[] = Array(8).fill(-Infinity);

  constructor(
    sprite: Sprite,
    seatsTaken: number,
    seats: Seat[],
    avoidAll: (Objeto & {
      left: number;
      top: number;
      right: number;
      bottom: number;
    })[],
    avoidFlex: (Objeto & {
      left: number;
      top: number;
      right: number;
      bottom: number;
    })[],
    world: {
      height: number;
      width: number;
    }
  ) {
    this.gameTimer = new GameTimer();
    this.sitting = false;
    this.velocidad = new Vector2();
    this.seatsTaken = seatsTaken;
    this.seats = seats;
    this.avoidAll = avoidAll;
    this.avoidFlex = avoidFlex;
    this.world = world;
    this.npc = sprite;
    this.setRandomDirection();
  }

  getState(): {
    direccion: Direccion | null;
    velocidadX: number;
    velocidadY: number;
    npcX: number;
    npcY: number;
    texture: string;
    randomSeat: {
      adjustedX: number;
      adjustedY: number;
      depthCount: number;
      anim: Direccion;
      depth: boolean;
    } | null;
  } {
    return {
      direccion: this.animacion,
      texture: this.npc.etiqueta,
      velocidadX:
        this.animacion == Direccion.Inactivo ||
        this.animacion == Direccion.Silla ||
        this.animacion == Direccion.Sofa
          ? 0
          : this.velocidad.x,
      velocidadY:
        this.animacion == Direccion.Inactivo ||
        this.animacion == Direccion.Silla ||
        this.animacion == Direccion.Sofa
          ? 0
          : this.velocidad.y,
      npcX: this.npc.x,
      npcY: this.npc.y,
      randomSeat:
        this.animacion == Direccion.Silla || this.animacion == Direccion.Sofa
          ? this.randomSeat
          : null,
    };
  }

  private setRandomDirection() {
    if (
      (this.gameTimer.timeAccumulated > this.lastIdleTime + 30000 ||
        Math.random() < this.idleProbability) &&
      this.moveCounter > 0
    ) {
      this.goIdle();
    } else if (
      this.moveCounter >= between(7, 13) &&
      this.seatsTaken < this.seats.length
    ) {
      this.goSit();
    } else {
      this.goMove();
    }
  }

  update(deltaTime: number) {
    this.gameTimer.tick(deltaTime);
    if (this.directionChangeCooldown > 0)
      this.directionChangeCooldown -= deltaTime;
    if (
      this.animacion !== Direccion.Inactivo &&
      this.animacion !== Direccion.Silla &&
      this.animacion !== Direccion.Sofa
    ) {
      this.npc.x += this.velocidad.x * (deltaTime / 1000) * this.speed;
      this.npc.y += this.velocidad.y * (deltaTime / 1000) * this.speed;
      this.willCollide();
      if (!this.sitting) {
        this.actualizarAnimacion();
        this.comprobarUbicacion();
      }
    }
  }

  private actualizarAnimacion() {
    const dx = this.velocidad.x;
    const dy = this.velocidad.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    let direccion: Direccion | null = null;
    if (Math.abs(absX - absY) <= Math.max(absX, absY) * 0.4) {
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

    this.animacion = direccion;
  }

  private willCollide() {
    let blockedDirections: Direccion[] = [];

    this.evitarObstaculos(
      this.npc.x + (this.npc.displayWidth * this.npc.escala.x) / 2,
      this.npc.x - (this.npc.displayWidth * this.npc.escala.x) / 2,
      this.npc.y + (this.npc.displayHeight * this.npc.escala.y) / 2,
      this.npc.y - (this.npc.displayHeight * this.npc.escala.y) / 2,
      blockedDirections
    );
    this.comprobarLimitesMundo(blockedDirections);
    if (blockedDirections.length > 0 && this.directionChangeCooldown <= 0) {
      if (!this.sitting) {
        this.evaluarDireccion(blockedDirections);
      } else {
        this.adjustPathTowardsChair(blockedDirections);
      }
    }
  }

  private evitarObstaculos(
    npcRightX: number,
    npcLeftX: number,
    npcBottomY: number,
    npcTopY: number,
    blockedDirections: Direccion[]
  ) {
    this.avoidAll.forEach((obstaculo) => {
      if (
        npcRightX > obstaculo.left &&
        npcLeftX < obstaculo.right &&
        npcBottomY > obstaculo.top &&
        npcTopY < obstaculo.bottom
      ) {
        const overlapRight = npcRightX - obstaculo.left;
        const overlapLeft = obstaculo.right - npcLeftX;
        const overlapBottom = npcBottomY - obstaculo.top;
        const overlapTop = obstaculo.bottom - npcTopY;

        if (overlapRight > 0) {
          blockedDirections.push(Direccion.Derecha);
        }
        if (overlapLeft > 0) {
          blockedDirections.push(Direccion.Izquierda);
        }
        if (overlapBottom > 0) {
          blockedDirections.push(Direccion.Abajo);
        }
        if (overlapTop > 0) {
          blockedDirections.push(Direccion.Arriba);
        }
      }
    });
    this.avoidFlex.forEach((obstaculo) => {
      if (
        Math.abs(this.npc.y - obstaculo.y) <
        (this.npc.displayHeight * this.npc.escala.y) / 2
      ) {
        if (npcRightX >= obstaculo.left && npcLeftX < obstaculo.left) {
          blockedDirections.push(Direccion.Derecha);
          console.log("der");
        }
        if (npcLeftX <= obstaculo.right && npcRightX > obstaculo.right) {
          blockedDirections.push(Direccion.Izquierda);
          console.log("iz");
        }
        if (npcTopY < obstaculo.bottom && npcBottomY > obstaculo.top) {
          if (this.npc.x >= obstaculo.left && this.npc.x < obstaculo.right) {
            if (npcBottomY > obstaculo.top) {
              blockedDirections.push(Direccion.Abajo);
              console.log("ab");
            }
            if (npcTopY < obstaculo.bottom) {
              blockedDirections.push(Direccion.Arriba);
              console.log("arr");
            }
          }
        }
      }
    });
  }

  private comprobarLimitesMundo(blockedDirections: Direccion[]) {
    const nextX = this.npc.x;
    const nextY = this.npc.y;
    if (
      nextX + (this.npc.displayWidth * this.npc.escala.x) / 2 >=
      this.world.width
    ) {
      blockedDirections.push(
        ...[Direccion.Derecha, Direccion.DerechaAbajo, Direccion.DerechaArriba]
      );
    }
    if (nextX - (this.npc.displayWidth * this.npc.escala.x) / 2 <= 0) {
      blockedDirections.push(
        ...[
          Direccion.Izquierda,
          Direccion.IzquierdaAbajo,
          Direccion.IzquierdaArriba,
        ]
      );
    }
    if (
      nextY + (this.npc.displayHeight * this.npc.escala.y) / 2 >=
      this.world.height
    ) {
      blockedDirections.push(
        ...[Direccion.Abajo, Direccion.IzquierdaAbajo, Direccion.DerechaAbajo]
      );
    }
    if (nextY - (this.npc.displayHeight * this.npc.escala.y) / 2 <= 0) {
      blockedDirections.push(
        ...[
          Direccion.Arriba,
          Direccion.IzquierdaArriba,
          Direccion.DerechaArriba,
        ]
      );
    }
  }

  private evaluarDireccion(blockedDirections: Direccion[]) {
    let availableDirections = Object.values(Direccion)
      .filter(
        (dir) =>
          dir !== Direccion.Silla &&
          dir !== Direccion.Sofa &&
          dir !== Direccion.Inactivo
      )
      .filter((dir) => !blockedDirections.includes(dir));

    if (availableDirections?.length > 0) {
      let angle: number, currentDireccion: Direccion;
      if (availableDirections?.length > 1) {
        const newAvailableDirections = availableDirections.filter(
          (dir) => !this.ultimoDirecciones?.includes(dir)
        );

        if (newAvailableDirections.length > 0) {
          currentDireccion =
            newAvailableDirections[
              Math.floor(Math.random() * newAvailableDirections.length)
            ];
        } else {
          currentDireccion =
            availableDirections[
              Math.floor(Math.random() * availableDirections.length)
            ];
        }

        this.ultimoDirecciones.unshift(currentDireccion);
        this.ultimoDirecciones = this.ultimoDirecciones.slice(0, 2);
      } else {
        currentDireccion = availableDirections[0];

        this.ultimoDirecciones.unshift(currentDireccion);
        this.ultimoDirecciones = this.ultimoDirecciones.slice(0, 2);
      }

      switch (currentDireccion) {
        case Direccion.Arriba:
          angle = -90;
          break;
        case Direccion.Abajo:
          angle = 90;
          break;
        case Direccion.Izquierda:
          angle = 180;
          break;
        case Direccion.Derecha:
          angle = 0;
          break;
        case Direccion.DerechaAbajo:
          angle = 45;
          break;
        case Direccion.DerechaArriba:
          angle = -45;
          break;
        case Direccion.IzquierdaAbajo:
          angle = 135;
          break;
        case Direccion.IzquierdaArriba:
          angle = 225;
          break;
        default:
          angle = 0;
      }
      this.velocidad = new Vector2(
        Math.cos(degToRad(angle)),
        Math.sin(degToRad(angle))
      );
      this.directionChangeCooldown = this.directionChangeMinInterval;
    }
  }

  private goIdle() {
    this.animacion = Direccion.Inactivo;
    this.velocidad = new Vector2();
    this.moveCounter = 0;
    this.gameTimer.setTimeout(() => {
      this.lastIdleTime = this.gameTimer.timeAccumulated;
      this.setRandomDirection();
    }, between(20000, 120000));
  }

  private goMove() {
    this.moveCounter++;
    const angle = between(0, 360);
    this.velocidad = new Vector2(Math.cos(angle), Math.sin(angle));
    this.actualizarAnimacion();
  }

  private comprobarUbicacion() {
    if (this.gameTimer.timeAccumulated > this.lastPositionCheckTime + 30000) {
      const currentRegionX = Math.floor(this.npc.x / (this.world.width / 8));
      const currentRegionY = Math.floor(this.npc.y / (this.world.height / 8));
      const currentRegionIndex = currentRegionY * 8 + currentRegionX;
      this.lastVisitedRegion[currentRegionIndex] =
        this.gameTimer.timeAccumulated;

      const leastVisitedRegionIndex = this.lastVisitedRegion.indexOf(
        Math.min(...this.lastVisitedRegion)
      );
      const targetRegionX =
        (leastVisitedRegionIndex % 8) * (this.world.width / 8) +
        this.world.width / 8 / 2;
      const targetRegionY =
        Math.floor(leastVisitedRegionIndex / 8) * (this.world.height / 8) +
        this.world.height / 8 / 2;

      const directionToTarget = Math.atan2(
        targetRegionY - this.npc.y,
        targetRegionX - this.npc.x
      );
      this.velocidad = new Vector2(
        Math.cos(directionToTarget),
        Math.sin(directionToTarget)
      );

      this.lastPositionCheckTime = this.gameTimer.timeAccumulated;
    }
  }

  private goSit() {
    this.sitting = true;
    this.seatsTaken++;
    console.log("go to seat");
    this.randomSeat = this.seats[between(0, this.seats.length - 1)];
    const dx = Number(this.randomSeat?.adjustedX) - this.npc.x;
    const dy = Number(this.randomSeat?.adjustedY) - this.npc.y;
    const angle = Math.atan2(dy, dx);
    this.velocidad = new Vector2(Math.cos(angle), Math.sin(angle));
    this.actualizarAnimacion();

    const checkArrival = () => {
      const distance = Math.sqrt(
        Math.pow(this.npc.x - Number(this.randomSeat?.adjustedX), 2) +
          Math.pow(this.npc.y - Number(this.randomSeat?.adjustedY), 2)
      );
      if (distance < 1) {
        this.velocidad = new Vector2();
        this.npc = {
          ...this.npc,
          x: this.randomSeat?.adjustedX!,
          y: this.randomSeat?.adjustedY!,
        };
        console.log("sitting");
        this.animacion = this.randomSeat?.anim!;
        this.gameTimer.setTimeout(() => {
          this.sitting = false;
          console.log("finished sitting");
          this.randomSeat = null;
          this.moveCounter = 0;
          this.seatsTaken--;
          this.setRandomDirection();
        }, between(120000, 240000));
      } else {
        this.gameTimer.setTimeout(checkArrival, 100);
      }
    };

    checkArrival();
  }

  private adjustPathTowardsChair(blockedDirections: Direccion[]) {
    if (!this.randomSeat) return;

    const dx = this.randomSeat.adjustedX - this.npc.x;
    const dy = this.randomSeat.adjustedY - this.npc.y;
    const angleToChair = Math.atan2(dy, dx);

    let isPathBlocked: boolean = false;
    this.avoidAll.concat(this.avoidFlex).forEach((obstaculo) => {
      if (
        this.isBlockingPath(
          this.npc.x,
          this.npc.y,
          this.randomSeat?.adjustedX!,
          this.randomSeat?.adjustedY!,
          obstaculo
        )
      ) {
        isPathBlocked = true;
      }
    });

    if (!isPathBlocked) {
      this.velocidad = new Vector2(
        Math.cos(angleToChair),
        Math.sin(angleToChair)
      );
    } else {
      const alternativePath = this.findAlternativePath(
        angleToChair,
        blockedDirections
      );
      this.velocidad = new Vector2(
        Math.cos(alternativePath),
        Math.sin(alternativePath)
      );
    }
  }

  private findAlternativePath(
    angleToChair: number,
    blockedDirections: Direccion[]
  ): number {
    let alternativeAngle = angleToChair;
    const angleAdjustment = Math.PI / 18;

    for (let i = 1; i <= 18; i++) {
      if (
        !blockedDirections.includes(
          this.angleToDirection(alternativeAngle + i * angleAdjustment)
        )
      ) {
        return alternativeAngle + i * angleAdjustment;
      }
      if (
        !blockedDirections.includes(
          this.angleToDirection(alternativeAngle - i * angleAdjustment)
        )
      ) {
        return alternativeAngle - i * angleAdjustment;
      }
    }

    return angleToChair;
  }

  private isBlockingPath(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    obstaculo: Objeto & {
      left: number;
      top: number;
      right: number;
      bottom: number;
    }
  ): boolean {
    const ox = (obstaculo.left + obstaculo.right) / 2;
    const oy = (obstaculo.top + obstaculo.bottom) / 2;
    const minDistance =
      Math.abs((y2 - y1) * ox - (x2 - x1) * oy + x2 * y1 - y2 * x1) /
      Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
    return minDistance < (obstaculo.right - obstaculo.left) / 2;
  }

  private angleToDirection(angle: number): Direccion {
    let normalizedAngle: number = angle % (2 * Math.PI);
    if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;
    if (
      normalizedAngle < Math.PI / 8 ||
      normalizedAngle >= (15 * Math.PI) / 8
    ) {
      return Direccion.Derecha;
    } else if (
      normalizedAngle >= Math.PI / 8 &&
      normalizedAngle < (3 * Math.PI) / 8
    ) {
      return Direccion.DerechaArriba;
    } else if (
      normalizedAngle >= (3 * Math.PI) / 8 &&
      normalizedAngle < (5 * Math.PI) / 8
    ) {
      return Direccion.Arriba;
    } else if (
      normalizedAngle >= (5 * Math.PI) / 8 &&
      normalizedAngle < (7 * Math.PI) / 8
    ) {
      return Direccion.IzquierdaArriba;
    } else if (
      normalizedAngle >= (7 * Math.PI) / 8 &&
      normalizedAngle < (9 * Math.PI) / 8
    ) {
      return Direccion.Izquierda;
    } else if (
      normalizedAngle >= (9 * Math.PI) / 8 &&
      normalizedAngle < (11 * Math.PI) / 8
    ) {
      return Direccion.IzquierdaAbajo;
    } else if (
      normalizedAngle >= (11 * Math.PI) / 8 &&
      normalizedAngle < (13 * Math.PI) / 8
    ) {
      return Direccion.Abajo;
    } else {
      return Direccion.DerechaAbajo;
    }
  }
}
