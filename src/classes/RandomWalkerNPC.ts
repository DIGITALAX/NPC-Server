import Phaser from "phaser";
import { Direccion, Seat } from "../types/src.types";

export default class RandomWalkerNPC extends Phaser.GameObjects.Sprite {
  direction!: Phaser.Math.Vector2;
  speed: number = 60;
  npc!: Phaser.Physics.Arcade.Sprite;
  lastPositionCheckTime: number;
  idleProbability: number = 0.3;
  lastIdleTime: number = 0;
  prof: Phaser.GameObjects.Image[];
  previousPosition: Phaser.Math.Vector2;
  lastDirection: Direccion | null = null;
  idle: boolean;
  moveCounter: number = 0;
  sitting: boolean;
  seatTaken: Seat | null = null;
  randomSeat: Seat | null = null;
  seats: Seat[];
  avoid: Phaser.GameObjects.Image[];

  constructor(
    scene: Phaser.Scene,
    sprite: {
      texture: string;
      x: number;
      y: number;
    },
    obs: Phaser.GameObjects.Image[],
    prof: Phaser.GameObjects.Image[],
    seats: Seat[],
    avoid: Phaser.GameObjects.Image[],
    cam: boolean
  ) {
    super(scene, sprite.x, sprite.y, sprite.texture);
    this.scene.physics.world.enable(this);
    this.lastPositionCheckTime = 0;
    this.idle = false;
    this.sitting = false;
    this.prof = prof;
    this.seats = seats;
    this.avoid = avoid;
    this.lastDirection;
    this.previousPosition = new Phaser.Math.Vector2(sprite.x, sprite.y);
    this.configureSprite(cam, sprite);
    this.gestionarObstaculos(obs);
  }

  private configureSprite(
    cam: boolean,
    sprite: {
      texture: string;
      x: number;
      y: number;
    }
  ) {
    this.npc = this.scene.physics.add
      .sprite(sprite.x, sprite.y, sprite.texture)
      .setScale(0.5);
    this.npc.body
      ?.setSize(this.npc.width / 2, this.npc.height, true)
      .setOffset(this.npc.width / 4, 0);

    if (cam) {
      this.scene.cameras.main.startFollow(this.npc, true, 0.05, 0.05);
    }

    this.configurarAnimaciones().then(() => this.setRandomDirection());
  }

  private setRandomDirection() {
    if (
      this.scene.time.now > this.lastIdleTime + 30000 ||
      Math.random() < this.idleProbability
    ) {
      this.goIdle();
    } else if (++this.moveCounter >= Phaser.Math.Between(7, 13)) {
      this.goSit();
    } else {
      this.moveCounter++;
      const angle = Phaser.Math.Between(0, 360);
      this.direction = new Phaser.Math.Vector2(
        Math.cos(angle),
        Math.sin(angle)
      ).scale(this.speed);
      this.npc.setVelocity(this.direction.x, this.direction.y);
      this.updateAnimation();
    }
  }

  update() {
    if (!this.idle) {
      this.willCollide();
      if (!this.sitting) {
        this.comprobarBordesDelMundo();
        this.updateAnimation();
        this.comprobarUbicacion();
      }
    }

    this.manejarProfundidad();
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
    let adjustedAngle = Phaser.Math.RadToDeg(
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

      let directionVector = new Phaser.Math.Vector2(
        Math.cos(Phaser.Math.DegToRad(adjustedAngle)),
        Math.sin(Phaser.Math.DegToRad(adjustedAngle))
      ).scale(this.speed);

      if (!this.isDirectionBlocked(directionVector, blockedDirections)) {
        this.direction = directionVector;
        this.updateAnimation();
        break;
      }
    }
  }

  private isDirectionBlocked(
    vector: Phaser.Math.Vector2,
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
      let dirVector = new Phaser.Math.Vector2(
        Math.cos(Phaser.Math.DegToRad(angle)),
        Math.sin(Phaser.Math.DegToRad(angle))
      ).scale(this.speed);
      if (!this.isDirectionBlocked(dirVector, blockedDirections)) {
        this.npc.setVelocity(dirVector.x, dirVector.y);
        this.direction = dirVector;
        this.updateAnimation();
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
          ? Phaser.Math.RadToDeg(
              Math.atan2(
                this.randomSeat.adjustedY - this.npc.y,
                this.randomSeat.adjustedX - this.npc.x
              )
            )
          : Phaser.Math.Between(0, 360);
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
      this.direction = new Phaser.Math.Vector2(
        Math.cos(Phaser.Math.DegToRad(angle)),
        Math.sin(Phaser.Math.DegToRad(angle))
      ).scale(this.speed);
      this.updateAnimation();
    }
  }

  private updateAnimation() {
    this.npc.setVelocity(this.direction.x, this.direction.y);
    const dx = this.direction.x;
    const dy = this.direction.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.abs(absX - absY) <= Math.max(absX, absY) * 0.3) {
      if (dx > 0 && dy > 0) {
        this.npc.anims.play(Direccion.DerechaAbajo, true);
      } else if (dx > 0 && dy < 0) {
        this.npc.anims.play(Direccion.DerechaArriba, true);
      } else if (dx < 0 && dy > 0) {
        this.npc.anims.play(Direccion.IzquierdaAbajo, true);
      } else if (dx < 0 && dy < 0) {
        this.npc.anims.play(Direccion.IzquierdaArriba, true);
      }
    } else if (absX > absY) {
      this.npc.anims.play(
        dx > 0 ? Direccion.Derecha : Direccion.Izquierda,
        true
      );
    } else {
      this.npc.anims.play(dy > 0 ? Direccion.Abajo : Direccion.Arriba, true);
    }
  }

  private gestionarObstaculos(obs: Phaser.GameObjects.Image[]) {
    this.npc.setCollideWorldBounds(true);
    obs.forEach((ob) => {
      this.scene.physics.add.collider(
        this.npc,
        ob,
        this.setRandomDirection,
        undefined,
        this
      );
    });
  }

  private goIdle() {
    this.idle = true;
    this.npc.setVelocity(0, 0);
    this.npc.anims.play(Direccion.Inactivo, true);
    this.lastIdleTime = this.scene.time.now;
    this.scene.time.delayedCall(
      Phaser.Math.Between(5000, 20000),
      () => {
        this.lastIdleTime = this.scene.time.now;
        this.idle = false;
        this.setRandomDirection();
      },
      [],
      this
    );
  }

  private comprobarUbicacion() {
    if (this.scene.time.now > this.lastPositionCheckTime + 15000) {
      const distance = Phaser.Math.Distance.Between(
        this.npc.x,
        this.npc.y,
        this.previousPosition.x,
        this.previousPosition.y
      );
      if (distance < 50) {
        this.setRandomDirection();
      }
      this.previousPosition.set(this.npc.x, this.npc.y);
      this.lastPositionCheckTime = this.scene.time.now;
    }
  }

  private comprobarBordesDelMundo() {
    const blocked = this.npc.body?.blocked;
    if (blocked?.right || blocked?.left || blocked?.up || blocked?.down) {
      let newAngle = 0;
      if (blocked.right) newAngle = Phaser.Math.Between(90, 270);
      else if (blocked.left) newAngle = Phaser.Math.Between(-90, 90);
      if (blocked.down) newAngle = Phaser.Math.Between(180, 360);
      else if (blocked.up) newAngle = Phaser.Math.Between(0, 180);
      this.direction = new Phaser.Math.Vector2(
        Math.cos(Phaser.Math.DegToRad(newAngle)),
        Math.sin(Phaser.Math.DegToRad(newAngle))
      ).scale(this.speed);
    }
  }

  private goSit() {
    this.sitting = true;
    this.randomSeat = this.seats[Phaser.Math.Between(0, this.seats.length - 1)];
    const dx = this.randomSeat.adjustedX - this.npc.x;
    const dy = this.randomSeat.adjustedY - this.npc.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const duration = (distance / this.speed) * 1000;

    const angle = Math.atan2(dy, dx);
    this.direction = new Phaser.Math.Vector2(
      Math.cos(angle),
      Math.sin(angle)
    ).scale(this.speed);

    const originalDepth = this.randomSeat.obj.depth;

    this.scene.tweens.add({
      targets: this.npc,
      x: this.randomSeat.adjustedX,
      y: this.randomSeat.adjustedY,
      duration: duration,
      ease: "Linear",
      onStart: () => {
        this.npc.setVelocity(
          this.direction.x * this.speed,
          this.direction.y * this.speed
        );

        this.updateAnimation();
      },
      onUpdate: this.updateAnimation.bind(this),
      onComplete: () => {
        this.seatTaken = this.randomSeat;
        this.npc.setVelocity(0, 0);

        if (this.randomSeat?.depth) {
          this.randomSeat?.obj.setDepth(this.npc.depth + 0.1);
        }

        this.npc.anims.play(this.randomSeat?.anim!, true);
        this.scene.time.delayedCall(
          Phaser.Math.Between(15000, 30000),
          () => {
            this.sitting = false;
            this.moveCounter = 0;
            this.randomSeat?.obj.setDepth(originalDepth);
            this.randomSeat = null;
            this.setRandomDirection();
            this.seatTaken = null;
          },
          [],
          this
        );
      },
    });
  }

  private async configurarAnimaciones() {
    this.scene.anims.create({
      key: Direccion.Inactivo,
      frames: this.anims.generateFrameNumbers(this.npc.texture.key, {
        start: 132,
        end: 143,
      }),
      frameRate: 0.3,
      repeat: -1,
    });
    this.anims.create({
      key: Direccion.DerechaArriba,
      frames: this.anims.generateFrameNumbers(this.npc.texture.key, {
        start: 60,
        end: 71,
      }),
      frameRate: 3,
      repeat: -1,
    });
    this.scene.anims.create({
      key: Direccion.Arriba,
      frames: this.anims.generateFrameNumbers(this.npc.texture.key, {
        start: 0,
        end: 11,
      }),
      frameRate: 3,
      repeat: -1,
    });
    this.scene.anims.create({
      key: Direccion.Izquierda,
      frames: this.anims.generateFrameNumbers(this.npc.texture.key, {
        start: 24,
        end: 35,
      }),
      frameRate: 3,
      repeat: -1,
    });
    this.scene.anims.create({
      key: Direccion.Abajo,
      frames: this.anims.generateFrameNumbers(this.npc.texture.key, {
        start: 12,
        end: 23,
      }),
      frameRate: 3,
      repeat: -1,
    });
    this.scene.anims.create({
      key: Direccion.Derecha,
      frames: this.anims.generateFrameNumbers(this.npc.texture.key, {
        start: 36,
        end: 47,
      }),
      frameRate: 3,
      repeat: -1,
    });
    this.scene.anims.create({
      key: Direccion.IzquierdaAbajo,
      frames: this.anims.generateFrameNumbers(this.npc.texture.key, {
        start: 72,
        end: 83,
      }),
      frameRate: 3,
      repeat: -1,
    });
    this.scene.anims.create({
      key: Direccion.IzquierdaArriba,
      frames: this.anims.generateFrameNumbers(this.npc.texture.key, {
        start: 48,
        end: 59,
      }),
      frameRate: 3,
      repeat: -1,
    });
    this.scene.anims.create({
      key: Direccion.DerechaAbajo,
      frames: this.anims.generateFrameNumbers(this.npc.texture.key, {
        start: 84,
        end: 95,
      }),
      frameRate: 3,
      repeat: -1,
    });
    this.scene.anims.create({
      key: Direccion.Sofa,
      frames: this.anims.generateFrameNumbers(this.npc.texture.key, {
        start: 97,
        end: 108,
      }),
      frameRate: 0.3,
      repeat: -1,
    });
    this.scene.anims.create({
      key: Direccion.Silla,
      frames: this.anims.generateFrameNumbers(this.npc.texture.key, {
        start: 108,
        end: 119,
      }),
      frameRate: 0.3,
      repeat: -1,
    });
  }

  private manejarProfundidad() {
    this.npc!.depth = this.npc!.y + this.npc!.height / 4;

    this.prof
      .filter((ob) =>
        this.seatTaken?.depth
          ? ob.texture.key !== this.seatTaken?.obj.texture.key
          : true
      )
      .forEach((item) => {
        if (item) {
          item.depth = item.y;
        }
      });

    if (this.seatTaken?.depth) {
      this.seatTaken?.obj.setDepth(this.npc.depth + 0.1);
    }
  }

  makeCameraFollow() {
    this.scene.cameras.main.startFollow(this.npc, true, 0.05, 0.05);
  }
}
