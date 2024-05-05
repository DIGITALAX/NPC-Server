import RandomWalkerNPC from "./classes/RandomWalkerNPC.js";
import { parentPort } from "worker_threads";
import PF from "pathfinding";
import { Estado, Seat, Sprite } from "./types/src.types.js";

const frameDuration: number = 10000;
let scenes: {
  [key: string]: {
    getState: () => Estado[][];
    update: (deltaTime: number) => void;
  };
} = {};

const updateGame = () => {
  if (Object.keys(scenes).length < 1) return;
  Object.keys(scenes).forEach((key) => {
    scenes[key].update(frameDuration);
  });
  setTimeout(updateGame, frameDuration);
};

parentPort?.on("message", (msg) => {
  if (msg.cmd === "initialize") {
    scenes[msg.key] = initializeScene({
      sprites: msg.sprites,
      sillasOcupadas: msg.sillasOcupadas,
      sillas: msg.sillas,
      prohibited: msg.prohibited,
      width: msg.width,
      height: msg.height,
    });
  } else if (msg.cmd === "start") {
    updateGame();
  } else if (msg.cmd === "requestState") {
    let state = scenes[msg.key]?.getState();
    parentPort?.postMessage({
      cmd: "stateResponse",
      key: msg.key,
      estados: state,
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

const initializeScene = (data: {
  sprites: Sprite[];
  sillasOcupadas: Seat[];
  sillas: Seat[];
  height: number;
  width: number;
  prohibited: {
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
}): {
  getState: () => Estado[][];
  update: (deltaTime: number) => void;
} => {
  let npcs = data.sprites.map(
    (sprite: Sprite) =>
      new RandomWalkerNPC(
        sprite,
        data.sillasOcupadas,
        data.sillas,
        initializeGrid(data.prohibited, data.width, data.height),
        {
          width: data.width,
          height: data.height,
        }
      )
  );
  return {
    getState: () => npcs.map((npc) => npc.getState()),
    update: (deltaTime: number) => npcs.forEach((npc) => npc.update(deltaTime)),
  };
};
