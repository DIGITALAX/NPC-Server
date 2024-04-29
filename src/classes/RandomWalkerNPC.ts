import { between, configurarDireccion } from "./../lib/utils.js";
import { Direccion, Sprite, Seat } from "./../types/src.types.js";
import Vector2 from "./Vector2.js";
import GameTimer from "./GameTimer.js";
import PF from "pathfinding";

export default class RandomWalkerNPC {
  private readonly seats: Seat[];
  private readonly speed: number = 60;
  private readonly grid: PF.Grid;
  private readonly world: { height: number; width: number };
  private readonly maxMoves: number;
  private velocidad!: Vector2;
  private aStar: PF.AStarFinder;
  private idle: boolean = false;
  private animacion: string | null = null;
  private npc!: Sprite;
  private seatsTaken: Seat[];
  private moveCounter: number = 0;
  private sitting: boolean = false;
  private onPath: boolean = false;
  private seated: boolean = false;
  private gameTimer: GameTimer;
  private randomSeat: Seat | null = null;
  private currentPathIndex: number = 0;
  private currentPath: { x: number; y: number }[] = [];
  private closestSeat: { x: number; y: number } | null = null;

  constructor(
    sprite: Sprite,
    seatsTaken: Seat[],
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
    this.maxMoves = sprite.maxMoves;
  }

  getState(): {
    direccion: string | null;
    velocidadX: number;
    velocidadY: number;
    npcX: number;
    npcY: number;
    texture: string;
    randomSeat: Seat | null;
  } {
    return {
      direccion: this.idle
        ? configurarDireccion(this.npc.etiqueta, Direccion.Inactivo)
        : this.seated
        ? configurarDireccion(this.npc.etiqueta, this.randomSeat?.anim!)
        : this.animacion,
      texture: this.npc.etiqueta,
      velocidadX:
        this.animacion ==
          configurarDireccion(this.npc.etiqueta, Direccion.Inactivo) ||
        this.animacion ==
          configurarDireccion(this.npc.etiqueta, Direccion.Silla) ||
        this.animacion == configurarDireccion(this.npc.etiqueta, Direccion.Sofa)
          ? 0
          : this.velocidad.x,
      velocidadY:
        this.animacion ==
          configurarDireccion(this.npc.etiqueta, Direccion.Inactivo) ||
        this.animacion ==
          configurarDireccion(this.npc.etiqueta, Direccion.Silla) ||
        this.animacion == configurarDireccion(this.npc.etiqueta, Direccion.Sofa)
          ? 0
          : this.velocidad.y,
      npcX: this.npc.x,
      npcY: this.npc.y,
      randomSeat:
        this.animacion ==
          configurarDireccion(this.npc.etiqueta, Direccion.Silla) ||
        this.animacion == configurarDireccion(this.npc.etiqueta, Direccion.Sofa)
          ? this.randomSeat
          : null,
    };
  }

  private setRandomDirection() {
    if (this.moveCounter >= this.maxMoves) {
      const probabilidadSit: number =
        this.seatsTaken.length < this.seats.length ? 0.5 : 0;
      const ajusteProbabilidad: number =
        this.seatsTaken.length / this.seats.length;
      const probabilidadFinalSit: number =
        probabilidadSit * (1 - ajusteProbabilidad);
      const decision: number = Math.random();
      if (decision < probabilidadFinalSit) {
        this.goSit();
      } else {
        this.goIdle();
      }
    } else {
      this.goMove();
    }
  }

  update(deltaTime: number) {
    if (this.grid) {
      this.gameTimer.tick(deltaTime);
      this.npc.x += this.velocidad.x * (deltaTime / 1000) * this.speed;
      this.npc.y += this.velocidad.y * (deltaTime / 1000) * this.speed;

      if (!this.sitting && !this.onPath && !this.idle) {
        this.setRandomDirection();
      }

      if (!this.seated) {
        this.seguirCamino();
      }

      this.actualizarAnimacion();
    }
  }

  private actualizarAnimacion() {
    if (this.idle) {
      this.animacion = configurarDireccion(
        this.npc.etiqueta,
        Direccion.Inactivo
      );
      return;
    } else if (this.seated) {
      this.animacion = configurarDireccion(
        this.npc.etiqueta,
        this.randomSeat?.anim!
      );
      return;
    }
    const dx = this.velocidad.x;
    const dy = this.velocidad.y;
    let direccion: string | null = null;
    let angulo = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angulo < 0) angulo += 360;
    if (angulo >= 337.5 || angulo < 22.5) {
      direccion = configurarDireccion(this.npc.etiqueta, Direccion.Derecha);
    } else if (angulo >= 22.5 && angulo < 67.5) {
      direccion = configurarDireccion(
        this.npc.etiqueta,
        Direccion.DerechaAbajo
      );
    } else if (angulo >= 67.5 && angulo < 112.5) {
      direccion = configurarDireccion(this.npc.etiqueta, Direccion.Abajo);
    } else if (angulo >= 112.5 && angulo < 157.5) {
      direccion = configurarDireccion(
        this.npc.etiqueta,
        Direccion.IzquierdaAbajo
      );
    } else if (angulo >= 157.5 && angulo < 202.5) {
      direccion = configurarDireccion(this.npc.etiqueta, Direccion.Izquierda);
    } else if (angulo >= 202.5 && angulo < 247.5) {
      direccion = configurarDireccion(
        this.npc.etiqueta,
        Direccion.IzquierdaArriba
      );
    } else if (angulo >= 247.5 && angulo < 292.5) {
      direccion = configurarDireccion(this.npc.etiqueta, Direccion.Arriba);
    } else if (angulo >= 292.5 && angulo < 337.5) {
      direccion = configurarDireccion(
        this.npc.etiqueta,
        Direccion.DerechaArriba
      );
    }
    this.animacion = direccion;
  }

  private goIdle() {
    this.idle = true;
    this.velocidad = new Vector2();
    this.animacion = configurarDireccion(this.npc.etiqueta, Direccion.Inactivo);
    const espera = between(20000, 120000);
    this.gameTimer.setTimeout(() => {
      this.idle = false;
      this.moveCounter = 0;
    }, espera);
  }

  private goMove() {
    this.onPath = true;
    this.moveCounter++;
    const destination = this.getRandomDestination();
    this.findPath(destination);
  }

  private findPath(destination: { x: number; y: number }) {
    let currentNPC: { x: number; y: number } = {
      x: Math.round(this.npc.x),
      y: Math.round(this.npc.y),
    };
    if (!this.grid.isWalkableAt(currentNPC.x, currentNPC.y)) {
      currentNPC = this.findNearestWalkable(currentNPC.x, currentNPC.y);
    }

    const path = this.aStar.findPath(
      currentNPC.x,
      currentNPC.y,
      destination.x,
      destination.y,
      this.grid.clone()
    );
    this.currentPathIndex = 0;
    this.currentPath = path.map((p) => ({ x: p[0], y: p[1] }));
  }

  private getRandomDestination(): { x: number; y: number } {
    let x: number, y: number;
    let attempts = 0,
      minDistance = 500;
    do {
      x = Math.floor(Math.random() * this.world.width);
      y = Math.floor(Math.random() * this.world.height);
      attempts++;
      if (attempts > 100) {
        minDistance = 0;
      }
    } while (
      !this.grid.isWalkableAt(x, y) ||
      Math.hypot(x - this.npc.x, y - this.npc.y) < minDistance
    );

    return { x, y };
  }

  private seguirCamino() {
    if (
      this.currentPath.length > 0 &&
      this.currentPathIndex < this.currentPath.length
    ) {
      const point = this.currentPath[this.currentPathIndex];
      if (Math.hypot(point.x - this.npc.x, point.y - this.npc.y) < 50) {
        this.currentPathIndex++;
        this.moveToNextPoint(point);
      }
    } else {
      if (this.sitting && !this.seated) {
        this.seated = true;
        this.animacion = configurarDireccion(
          this.npc.etiqueta,
          this.randomSeat?.anim!
        );
        this.npc = {
          ...this.npc,
          x: this.randomSeat?.adjustedX!,
          y: this.randomSeat?.adjustedY!,
        };
        this.gameTimer.setTimeout(() => {
          this.sitting = false;
          this.seated = false;
          if (this.closestSeat) {
            this.npc = {
              ...this.npc,
              x: this.closestSeat!?.x,
              y: this.closestSeat!?.y,
            };
          }
          this.moveCounter = 0;
          this.seatsTaken = this.seatsTaken.filter(
            (item) => item.etiqueta !== this.randomSeat?.etiqueta
          );
          this.randomSeat = null;
        }, between(120000, 240000));
      } else {
        this.onPath = false;
      }
      this.velocidad = new Vector2();
    }
  }

  private moveToNextPoint(target: { x: number; y: number }): void {
    const dx = target.x - this.npc.x;
    const dy = target.y - this.npc.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 10) return;
    const angulo = Math.atan2(dy, dx);

    this.velocidad = new Vector2(Math.cos(angulo), Math.sin(angulo));
    this.actualizarAnimacion();
  }

  private async goSit() {
    this.sitting = true;
    this.randomSeat = this.seats.filter(
      (seat) =>
        !this.seatsTaken.map((silla) => silla.etiqueta).includes(seat.etiqueta)
    )?.[between(0, this.seats.length - 1)];
    this.seatsTaken = [...this.seatsTaken, this.randomSeat];

    let seatX: number = this.randomSeat?.adjustedX,
      seatY: number = this.randomSeat?.adjustedY;

    if (!this.grid.isWalkableAt(seatX, seatY)) {
      const nearestWalkable = this.findNearestWalkable(seatX, seatY);
      seatX = nearestWalkable.x;
      seatY = nearestWalkable.y;
    }
    this.closestSeat = {
      x: seatX,
      y: seatY,
    };
    this.findPath(this.closestSeat);
  }

  private findNearestWalkable(x: number, y: number): { x: number; y: number } {
    let currentY = y;

    while (currentY < this.world.height) {
      if (this.grid.isWalkableAt(x, currentY)) {
        return { x, y: currentY };
      }
      currentY++;
    }

    currentY = y;
    while (currentY >= 0) {
      if (this.grid.isWalkableAt(x, currentY)) {
        return { x, y: currentY };
      }
      currentY--;
    }

    return { x, y };
  }
}
