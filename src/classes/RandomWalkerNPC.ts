import { between, degToRad } from "./../lib/utils.js";
import {
  Direccion,
  Sprite,
  Objeto,
  Seat,
  Articulo,
} from "./../types/src.types.js";
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
  private readonly avoidFlex: (Articulo & {
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
    avoidFlex: (Articulo & {
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
    randomSeat: Seat | null;
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
    console.log(
      this.moveCounter >= between(7, 13),
      this.seatsTaken < this.seats.length
    );
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
    let direccion: Direccion | null = null;
    let angulo = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angulo < 0) angulo += 360;
    if (angulo >= 348.75 || angulo < 11.25) {
      direccion = Direccion.Derecha;
    } else if (angulo >= 11.25 && angulo < 33.75) {
      direccion = Direccion.DerechaAbajo;
    } else if (angulo >= 33.75 && angulo < 56.25) {
      direccion = Direccion.DerechaAbajo;
    } else if (angulo >= 56.25 && angulo < 78.75) {
      direccion = Direccion.DerechaAbajo;
    } else if (angulo >= 78.75 && angulo < 101.25) {
      direccion = Direccion.Abajo;
    } else if (angulo >= 101.25 && angulo < 123.75) {
      direccion = Direccion.IzquierdaAbajo;
    } else if (angulo >= 123.75 && angulo < 146.25) {
      direccion = Direccion.IzquierdaAbajo;
    } else if (angulo >= 146.25 && angulo < 168.75) {
      direccion = Direccion.IzquierdaAbajo;
    } else if (angulo >= 168.75 && angulo < 191.25) {
      direccion = Direccion.Izquierda;
    } else if (angulo >= 191.25 && angulo < 213.75) {
      direccion = Direccion.IzquierdaArriba;
    } else if (angulo >= 213.75 && angulo < 236.25) {
      direccion = Direccion.IzquierdaArriba;
    } else if (angulo >= 236.25 && angulo < 258.75) {
      direccion = Direccion.IzquierdaArriba;
    } else if (angulo >= 258.75 && angulo < 281.25) {
      direccion = Direccion.Arriba;
    } else if (angulo >= 281.25 && angulo < 303.75) {
      direccion = Direccion.DerechaArriba;
    } else if (angulo >= 303.75 && angulo < 326.25) {
      direccion = Direccion.DerechaArriba;
    } else if (angulo >= 326.25 && angulo < 348.75) {
      direccion = Direccion.DerechaArriba;
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
        // this.adjustPathTowardsChair(blockedDirections);
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
        npcLeftX <= obstaculo.right &&
        npcRightX >= obstaculo.right &&
        npcTopY <= obstaculo.bottom &&
        npcBottomY >= obstaculo.top
      ) {
        console.log("eviIz");
        blockedDirections.push(
          ...[
            Direccion.Izquierda,
            Direccion.IzquierdaArribaIzquierda,
            Direccion.IzquierdaAbajoIzquierda,
          ]
        );
      }
      if (
        npcRightX >= obstaculo.left &&
        npcLeftX <= obstaculo.left &&
        npcTopY <= obstaculo.bottom &&
        npcBottomY >= obstaculo.top
      ) {
        console.log("eviDer");
        blockedDirections.push(
          ...[
            Direccion.Derecha,
            Direccion.DerechaAbajoDerecha,
            Direccion.DerechaArribaDerecha,
          ]
        );
      }
      if (
        npcBottomY >= obstaculo.top &&
        npcTopY <= obstaculo.top &&
        npcRightX >= obstaculo.left &&
        npcLeftX <= obstaculo.right
      ) {
        console.log("eviAb");
        blockedDirections.push(
          ...[
            Direccion.Abajo,
            Direccion.AbajoAbajoIzquierda,
            Direccion.AbajoAbajoDerecha,
          ]
        );
      }
      if (
        npcTopY <= obstaculo.bottom &&
        npcBottomY >= obstaculo.bottom &&
        npcRightX >= obstaculo.left &&
        npcLeftX <= obstaculo.right
      ) {
        console.log("eviArr");
        blockedDirections.push(
          ...[
            Direccion.Arriba,
            Direccion.ArribaArribaIzquierda,
            Direccion.ArribaArribaDerecha,
          ]
        );
      }
    });
    // this.avoidFlex.forEach((obstaculo) => {
    //   if (
    //     npcRightX > obstaculo.left &&
    //     npcLeftX < obstaculo.right &&
    //     npcBottomY > obstaculo.top &&
    //     npcTopY < obstaculo.bottom
    //     //  &&
    //     // newDepth === obstacle.depth
    //   ) {
    //     let horizontalOverlap = Math.min(
    //       npcRightX - obstaculo.left,
    //       obstaculo.right - npcLeftX
    //     );
    //     let verticalOverlap = Math.min(
    //       npcBottomY - obstaculo.top,
    //       obstaculo.bottom - npcTopY
    //     );

    //     if (horizontalOverlap < verticalOverlap) {
    //       blockedDirections.push(
    //         ...(this.npc.x < obstaculo.x
    //           ? [
    //               Direccion.Izquierda,
    //               Direccion.IzquierdaAbajo,
    //               Direccion.IzquierdaArriba,
    //             ]
    //           : [
    //               Direccion.Derecha,
    //               Direccion.DerechaAbajo,
    //               Direccion.DerechaArriba,
    //             ])
    //       );
    //     } else {
    //       blockedDirections.push(
    //         ...(this.npc.y < obstaculo.y
    //           ? [
    //               Direccion.Arriba,
    //               Direccion.DerechaArriba,
    //               Direccion.IzquierdaArriba,
    //             ]
    //           : [
    //               Direccion.Abajo,
    //               Direccion.DerechaAbajo,
    //               Direccion.IzquierdaAbajo,
    //             ])
    //       );
    //     }
    //   }
    // });
  }

  private comprobarLimitesMundo(blockedDirections: Direccion[]) {
    const nextX = this.npc.x;
    const nextY = this.npc.y;
    if (
      nextX + (this.npc.displayWidth * this.npc.escala.x) / 2 >=
      this.world.width
    ) {
      blockedDirections.push(
        ...[
          Direccion.Derecha,
          Direccion.DerechaAbajo,
          Direccion.DerechaArriba,
          Direccion.DerechaAbajoDerecha,
          Direccion.DerechaArribaDerecha,
          Direccion.AbajoAbajoDerecha,
          Direccion.ArribaArribaDerecha,
        ]
      );
      console.log("paredDer");
    }
    if (nextX - (this.npc.displayWidth * this.npc.escala.x) / 2 <= 0) {
      blockedDirections.push(
        ...[
          Direccion.Izquierda,
          Direccion.IzquierdaAbajo,
          Direccion.IzquierdaArriba,
          Direccion.IzquierdaAbajoIzquierda,
          Direccion.IzquierdaArribaIzquierda,
          Direccion.AbajoAbajoIzquierda,
          Direccion.ArribaArribaIzquierda,
        ]
      );
      console.log("paredIz");
    }
    if (
      nextY + (this.npc.displayHeight * this.npc.escala.y) / 2 >=
      this.world.height
    ) {
      blockedDirections.push(
        ...[
          Direccion.Abajo,
          Direccion.IzquierdaAbajo,
          Direccion.DerechaAbajo,
          Direccion.AbajoAbajoIzquierda,
          Direccion.AbajoAbajoDerecha,
          Direccion.DerechaAbajoDerecha,
          Direccion.IzquierdaAbajoIzquierda,
        ]
      );
      console.log("paredAbajo");
    }
    if (nextY - (this.npc.displayHeight * this.npc.escala.y) / 2 <= 0) {
      blockedDirections.push(
        ...[
          Direccion.Arriba,
          Direccion.IzquierdaArriba,
          Direccion.DerechaArriba,
          Direccion.ArribaArribaIzquierda,
          Direccion.ArribaArribaDerecha,
          Direccion.DerechaArribaDerecha,
          Direccion.IzquierdaArribaIzquierda,
        ]
      );
      console.log("paredArriba");
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

    console.log({ blockedDirections });

    if (availableDirections?.length > 0) {
      console.log("si");
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
}
