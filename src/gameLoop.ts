import { parentPort } from "worker_threads";
const frameDuration: number = 1000 / 60;

const updateGame = () => {
  const deltaTime = frameDuration;
  parentPort?.postMessage({ deltaTime });

  setTimeout(updateGame, frameDuration);
};

parentPort?.on("message", (msg) => {
  if (msg.cmd === "start") {
    updateGame();
  }
});
