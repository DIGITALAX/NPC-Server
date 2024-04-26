import { between } from "./../lib/utils.js";
import { Direccion, Sprite, Seat } from "./../types/src.types.js";
import Vector2 from "./Vector2.js";
import GameTimer from "./GameTimer.js";
import PF from "pathfinding";

export default class RandomWalkerNPC {
  private readonly seats: Seat[];
  private readonly speed: number = 60;
  private readonly grid: PF.Grid;
  private readonly world: { height: number; width: number };
  private velocidad!: Vector2;
  private aStar: PF.AStarFinder;
  private idle: boolean = false;
  private animacion: Direccion | null = null;
  private npc!: Sprite;
  private seatsTaken: number;
  private moveCounter: number = 0;
  private sitting: boolean = false;
  private onPath: boolean = false;
  private gameTimer: GameTimer;
  private randomSeat: Seat | null = null;
  private currentPathIndex: number = 0;
  private currentPath: { x: number; y: number }[] = [];

  constructor(
    sprite: Sprite,
    seatsTaken: number,
    seats: Seat[],
    aStar: {
      grid: PF.Grid;
      astar: PF.AStarFinder;
    },
    world: { height: number; width: number }
  ) {
    this.gameTimer = new GameTimer();
    this.velocidad = new Vector2();
    this.seatsTaken = seatsTaken;
    this.seats = seats;
    this.grid = aStar.grid;
    this.aStar = aStar.astar;
    this.npc = sprite;
    this.world = world;
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
      direccion: this.idle
        ? Direccion.Inactivo
        : this.velocidad == new Vector2() && this.randomSeat
        ? this.randomSeat?.anim
        : this.animacion,
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
    const probabilidadSit: number =
      this.seatsTaken < this.seats.length ? 0.5 : 0;
    const ajusteProbabilidad: number = this.seatsTaken / this.seats.length;
    const probabilidadFinalSit: number =
      probabilidadSit * (1 - ajusteProbabilidad);
    const decision: number = Math.random();
    // if (this.moveCounter >= 3 && decision < probabilidadFinalSit) {
    // this.goSit();
    // }
    // else
    if (this.moveCounter >= 6 && decision >= probabilidadFinalSit) {
      this.goIdle();
    } else {
      this.goMove();
    }
  }

  update(deltaTime: number) {
    if (this.grid) {
      this.gameTimer.tick(deltaTime);
      this.npc.x += this.velocidad.x * (deltaTime / 1000) * this.speed;
      this.npc.y += this.velocidad.y * (deltaTime / 1000) * this.speed;

      if (!this.sitting && !this.onPath) {
        this.setRandomDirection();
      }
      this.seguirCamino();
      this.actualizarAnimacion();
    }
  }

  private actualizarAnimacion() {
    if (
      this.velocidad == new Vector2() &&
      (this.animacion == Direccion.Inactivo ||
        this.animacion == Direccion.Silla ||
        this.animacion == Direccion.Sofa)
    )
      return;
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

  private goIdle() {
    this.idle = true;
    this.velocidad = new Vector2();
    this.animacion = Direccion.Inactivo;
    this.moveCounter = 0;
    this.gameTimer.setTimeout(() => {
      this.setRandomDirection();
      this.idle = false;
    }, between(20000, 120000));
  }

  private goMove() {
    this.onPath = true;
    this.moveCounter++;

    const destination = this.getRandomDestination();
    console.log(this.npc.x, this.npc.y, destination.x, destination.y);
    const path = this.aStar.findPath(
      Math.round(this.npc.x),
      Math.round(this.npc.y),
      destination.x,
      destination.y,
      this.grid.clone()
    );
    console.log({ path });

    this.currentPathIndex = 0;
    this.currentPath = path.map((p) => ({ x: p[0], y: p[1] }));
  }

  private getRandomDestination(): { x: number; y: number } {
    let x: number, y: number;
    do {
      x = Math.floor(Math.random() * this.world.width);
      y = Math.floor(Math.random() * this.world.height);
    } while (!this.grid.isWalkableAt(x, y));
    return { x, y };
  }

  private seguirCamino() {
    if (
      this.currentPath.length > 0 &&
      this.currentPathIndex < this.currentPath.length
    ) {
      console.log("in");
      const point = this.currentPath[this.currentPathIndex];
      if (Math.hypot(point.x - this.npc.x, point.y - this.npc.y) < 10) {
        this.currentPathIndex++;
        this.moveToNextPoint();
      }
    }
  }

  private moveToNextPoint(): void {
    if (this.currentPath && this.currentPathIndex < this.currentPath.length) {
      const target = this.currentPath[this.currentPathIndex];
      this.velocidad = this.calculateDirection(
        this.npc.x,
        this.npc.y,
        target.x,
        target.y
      );
      this.actualizarAnimacion();
    } else {
      this.velocidad = new Vector2(0, 0);
      this.currentPath = [];
    }
  }

  private calculateDirection(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): Vector2 {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) return new Vector2(0, 0);
    const dirX = (dx / distance) * this.speed;
    const dirY = (dy / distance) * this.speed;
    return new Vector2(dirX, dirY);
  }

  // private async goSit() {
  //   this.sitting = true;
  //   this.seatsTaken++;
  //   this.randomSeat = this.seats[between(0, this.seats.length - 1)];

  //   this.animacion = this.randomSeat?.anim!;
  //   this.velocidad = new Vector2();
  //   this.npc = {
  //     ...this.npc,
  //     x: this.randomSeat?.adjustedX!,
  //     y: this.randomSeat?.adjustedY!,
  //   };
  //   console.log("sitting");
  //   this.gameTimer.setTimeout(() => {
  //     this.sitting = false;
  //     console.log("finished sitting");
  //     this.randomSeat = null;
  //     this.moveCounter = 0;
  //     this.seatsTaken--;
  //     this.setRandomDirection();
  //   }, between(120000, 240000));
  // }
}
