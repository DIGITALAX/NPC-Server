import { Escena, Estado, Seat } from "../types/src.types";
import { Worker } from "worker_threads";

export default class EscenaEstudio {
  readonly key: string;
  sillasOcupadas: Seat[] = [];
  private worker: Worker;

  constructor(escena: Escena) {
    this.key = escena.key;

    let width: number =
        escena.world.width -
        (escena.sprites?.[0]?.displayWidth * escena.sprites?.[0]?.escala.x) / 2,
      height: number =
        escena.world.height -
        (escena.sprites?.[0]?.displayHeight * escena.sprites?.[0]?.escala.y) /
          2;

    this.worker = new Worker(new URL("./../gameLoop.js", import.meta.url), {
      name: this.key,
    });
    this.worker.postMessage({
      cmd: "initialize",
      sprites: escena.sprites,
      prohibited: escena.prohibited,
      width,
      height,
      key: this.key,
      sillasOcupadas: this.sillasOcupadas,
      sillas: escena.sillas,
    });

    this.worker.on("error", (error) => {
      console.error("Worker error for:", this.key, error);
    });
    this.worker.postMessage({ cmd: "start" });
  }

  requestState(): Promise<{
    cmd: string,
    key: string,
    estados: Estado[][],
  }> {
    return new Promise((resolve, reject) => {
      this.worker.once("message", (message) => {
        if (message.cmd === "stateResponse") {
          resolve(message.state);
        } else {
          reject(new Error("Failed to get state"));
        }
      });
      this.worker.postMessage({ cmd: "requestState" });
    });
  }
}
