import RandomWalkerNPC from "./classes/RandomWalkerNPC.js";
import { parentPort } from "worker_threads";
import PF from "pathfinding";
import { Sprite } from "./types/src.types.js";

const frameDuration: number = 1000 / 60;
let running: boolean = false;
let npcs: RandomWalkerNPC[] = [];
let key: string;

const updateGame = () => {
  if (!running || npcs.length < 1) return;
  const deltaTime = frameDuration;
  npcs.forEach((npc) => npc.update(deltaTime));
  setTimeout(updateGame, frameDuration);
};

parentPort?.on("message", (msg) => {
  if (msg.cmd === "initialize") {
    key = msg.key;
    npcs = msg.sprites.map((sprite: Sprite) => {
      return new RandomWalkerNPC(
        sprite,
        msg.sillasOcupadas,
        msg.sillas,
        initializeGrid(msg.prohibited, msg.width, msg.height),
        {
          width: msg.width,
          height: msg.height,
        }
      );
    });
  } else if (msg.cmd === "start" && !running) {
    running = true;
    updateGame();
  } else if (msg.cmd === "requestState") {
    parentPort?.postMessage({
      cmd: "stateResponse",
      key,
      estados: npcs.map((npc) => npc.getState()),
    });
  }
});

const initializeGrid = (
  prohibited: {
    x: number;
    y: number;
    width: number;
    height: number;
  }[],
  width: number,
  height: number
): {
  grid: PF.Grid;
  astar: PF.AStarFinder;
} => {
  const grid = new PF.Grid(width, height);
  prohibited.forEach((area) => {
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
};
