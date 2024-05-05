import { between } from "./../lib/utils.js";
import { Sprite, Seat, Estado, Movimiento } from "./../types/src.types.js";
import GameTimer from "./GameTimer.js";
import PF from "pathfinding";

export default class RandomWalkerNPC {
  private readonly seats: Seat[];
  private readonly grid: PF.Grid;
  private readonly world: { height: number; width: number };
  private readonly maxMoves: number;
  private caminos: Estado[];
  private aStar: PF.AStarFinder;
  private npc!: Sprite;
  private seatsTaken: Seat[];
  private moveCounter: number = 0;
  private gameTimer: GameTimer;
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
    this.seatsTaken = seatsTaken;
    this.seats = seats;
    this.grid = aStar.grid;
    this.aStar = aStar.astar;
    this.npc = sprite;
    this.world = world;
    this.maxMoves = sprite.maxMoves;
    this.caminos = [];
  }

  getState(): Estado[] {
    const returnValues = this.caminos;
    this.caminos = [];

    return returnValues;
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
      this.setRandomDirection();
    }
  }

  private goIdle() {
    this.caminos.push({
      estado: Movimiento.Idle,
      puntosDeCamino: [],
      duracion: between(20000, 120000),
      npcEtiqueta: this.npc.etiqueta,
    });
  }

  private goMove() {
    this.moveCounter++;
    this.caminos.push({
      estado: Movimiento.Move,
      puntosDeCamino: this.findPath(this.getRandomDestination()),
      duracion: between(20000, 120000),
      npcEtiqueta: this.npc.etiqueta,
    });
  }

  private findPath(destination: { x: number; y: number }): {
    x: number;
    y: number;
  }[] {
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
    return path.map((p) => ({ x: p[0], y: p[1] }));
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

    this.npc.x = x;
    this.npc.y = y;

    return { x, y };
  }

  private async goSit() {
    const randomSeat = this.seats.filter(
      (seat) =>
        !this.seatsTaken.map((silla) => silla.etiqueta).includes(seat.etiqueta)
    )?.[between(0, this.seats.length - 1)];
    this.seatsTaken = [...this.seatsTaken, randomSeat];

    let seatX: number = randomSeat?.adjustedX,
      seatY: number = randomSeat?.adjustedY;

    if (!this.grid.isWalkableAt(seatX, seatY)) {
      const nearestWalkable = this.findNearestWalkable(seatX, seatY);
      seatX = nearestWalkable.x;
      seatY = nearestWalkable.y;
    }
    this.closestSeat = {
      x: seatX,
      y: seatY,
    };

    this.caminos.push({
      estado: Movimiento.Sit,
      puntosDeCamino: this.findPath(this.closestSeat),
      duracion: between(120000, 240000),
      npcEtiqueta: this.npc.etiqueta,
      randomSeat: randomSeat.etiqueta,
    });

    this.npc.x = this.closestSeat.x;
    this.npc.y = this.closestSeat.y;
    this.seatsTaken = this.seatsTaken.filter(
      (item) => item.etiqueta !== randomSeat?.etiqueta
    );
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
