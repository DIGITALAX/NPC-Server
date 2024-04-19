import { parentPort } from "worker_threads";

parentPort?.on("message", (message) => {
  if (message.type === "start") {
    const frameDuration = message.frameDuration;
    let lastUpdateTime = message.initialTime;

    const updateGame = () => {
      const now = Date.now();
      const deltaTime = now - lastUpdateTime;

      if (deltaTime >= frameDuration) {
        parentPort?.postMessage({ deltaTime });

        lastUpdateTime = now - (deltaTime % frameDuration);
      }

      setTimeout(updateGame, frameDuration);
    };

    updateGame();
  }
});
