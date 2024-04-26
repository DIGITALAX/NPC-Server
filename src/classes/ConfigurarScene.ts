import { Escena } from "./../types/src.types";
import RandomWalkerNPC from "./RandomWalkerNPC.js";
import PF from "pathfinding";

export default class EscenaEstudio {
  readonly key: string;
  npcs: RandomWalkerNPC[] = [];
  sillasOcupadas: number = 0;

  constructor(escena: Escena) {
    this.key = escena.key;
    let width: number =
        escena.world.width -
        (escena.sprites?.[0]?.displayWidth * escena.sprites?.[0]?.escala.x) / 2,
      height: number =
        escena.world.height -
        (escena.sprites?.[0]?.displayHeight * escena.sprites?.[0]?.escala.y) /
          2;

    const aStar = this.initializeGrid(escena, width, height);

    this.npcs = escena.sprites.map((sprite) => {
      return new RandomWalkerNPC(
        sprite,
        this.sillasOcupadas,
        escena.sillas,
        aStar,
        {
          width,
          height,
        }
      );
    });
  }

  private initializeGrid(
    escena: Escena,
    width: number,
    height: number
  ): {
    grid: PF.Grid;
    astar: PF.AStarFinder;
  } {
    const grid = new PF.Grid(width, height);

    escena.prohibited.forEach((area) => {
      const startX = Math.max(0, area.x);
      const endX = Math.min(width - 1, area.x + area.width - 1);
      const startY = Math.max(0, area.y);
      const endY = Math.min(height - 1, area.y + area.height - 1);
      for (let y = startY; y <= endY; y++) {
        for (let x = startX; x <= endX; x++) {
          grid.setWalkableAt(x, y, false);
        }
      }
    });

    return {
      grid,
      astar: new PF.AStarFinder({
        diagonalMovement: 1,
      }),
    };
  }
}
