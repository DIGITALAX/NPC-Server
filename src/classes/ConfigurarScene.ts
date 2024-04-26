import { Escena } from "./../types/src.types";
import RandomWalkerNPC from "./RandomWalkerNPC.js";
import PF from "pathfinding";

export default class EscenaEstudio {
  readonly key: string;
  npcs: RandomWalkerNPC[] = [];
  sillasOcupadas: number = 0;

  constructor(escena: Escena) {
    this.key = escena.key;
    const aStar = this.initializeGrid(escena);

    this.npcs = escena.sprites.map((sprite) => {
      return new RandomWalkerNPC(
        sprite,
        this.sillasOcupadas,
        escena.sillas,
        aStar,
        escena.world
      );
    });
  }

  private initializeGrid(escena: Escena): {
    grid: PF.Grid;
    astar: PF.AStarFinder;
  } {
    const grid = new PF.Grid(escena.world.width, escena.world.height);

    escena.prohibited.forEach((area) => {
      const startX = Math.max(0, area.x);
      const endX = Math.min(escena.world.width - 1, area.x + area.width - 1);
      const startY = Math.max(0, area.y);
      const endY = Math.min(escena.world.height - 1, area.y + area.height - 1);
      for (let y = startY; y <= endY; y++) {
        for (let x = startX; x <= endX; x++) {
          grid.setWalkableAt(x, y, false);
        }
      }
    });

    return { grid, astar: new PF.AStarFinder() };
  }
}
