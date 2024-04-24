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
  private idleProbability: number = 0.3;
  private lastIdleTime: number = 0;
  private moveCounter: number = 0;
  private sitting: boolean;
  private gameTimer: GameTimer;
  private randomSeat: Seat | null = null;

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
    if (
      (this.gameTimer.timeAccumulated > this.lastIdleTime + 30000 ||
        Math.random() < this.idleProbability) &&
      this.moveCounter > 0
    ) {
      this.goIdle();
    } else if (
      this.moveCounter++ >= between(7, 13) &&
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

    this.evitarObstaculosFijos(
      this.npc.x + (this.npc.displayWidth * this.npc.escala.x) / 2,
      this.npc.x - (this.npc.displayWidth * this.npc.escala.x) / 2,
      this.npc.y + (this.npc.displayHeight * this.npc.escala.y) / 2,
      this.npc.y - (this.npc.displayHeight * this.npc.escala.y) / 2,
      blockedDirections
    );
    this.evitarObstaculosProfundos(
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
  private evitarObstaculosProfundos(
    npcRightX: number,
    npcLeftX: number,
    npcBottomY: number,
    npcTopY: number,
    blockedDirections: Direccion[]
  ) {
    this.avoidFlex.forEach((obstaculo) => {
      const isNearY = Math.abs(this.npc.y - obstaculo.sitio.y) <= 50;

      if (isNearY) {
        if (
          npcLeftX <= obstaculo.right &&
          npcTopY <= obstaculo.bottom &&
          npcBottomY >= obstaculo.top
        ) {
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
          npcTopY <= obstaculo.bottom &&
          npcBottomY >= obstaculo.top
        ) {
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
          npcRightX >= obstaculo.left &&
          npcLeftX <= obstaculo.right
        ) {
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
          npcRightX >= obstaculo.left &&
          npcLeftX <= obstaculo.right
        ) {
          blockedDirections.push(
            ...[
              Direccion.Arriba,
              Direccion.ArribaArribaIzquierda,
              Direccion.ArribaArribaDerecha,
            ]
          );
        }
      }
    });
  }

  private evitarObstaculosFijos(
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
        blockedDirections.push(
          ...[
            Direccion.Arriba,
            Direccion.ArribaArribaIzquierda,
            Direccion.ArribaArribaDerecha,
          ]
        );
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
      this.moveCounter++
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
