import { parentPort } from "worker_threads";
let lastUpdateTime: number = Date.now();
const frameDuration: number = 50;

const updateGame = () => {
  const now: number = Date.now();
  const deltaTime: number = now - lastUpdateTime;

  if (deltaTime >= frameDuration) {
    parentPort?.postMessage({ deltaTime });
    lastUpdateTime = now - (deltaTime % frameDuration);
  }

  setImmediate(updateGame);
};

parentPort?.on("message", (msg) => {
  if (msg.cmd === "start") {
    updateGame();
  }
});
