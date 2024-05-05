import { Escena, Estado, Seat } from "../types/src.types";
import { Worker } from "worker_threads";

export default class EscenaEstudio {
  readonly key: string;
  sillasOcupadas: Seat[] = [];
  private worker: Worker;

  constructor(escena: Escena, worker: Worker) {
    this.key = escena.key;
    this.worker = worker;

    let width: number =
        escena.world.width -
        (escena.sprites?.[0]?.displayWidth * escena.sprites?.[0]?.escala.x) / 2,
      height: number =
        escena.world.height -
        (escena.sprites?.[0]?.displayHeight * escena.sprites?.[0]?.escala.y) /
          2;

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

    this.worker.postMessage({
      cmd: "start",
    });
  }

  requestState(): Promise<{
    cmd: string;
    key: string;
    estados: Estado[][];
  }> {
    return new Promise((resolve) => {
      const listener = (message: {
        cmd: string;
        key: string;
        estados: Estado[][];
      }) => {
        if (message.cmd === "stateResponse" && message.key === this.key) {
          resolve(message);
          this.worker.off("message", listener);
        }
      };
      this.worker.on("message", listener);
      this.worker.postMessage({ cmd: "requestState", key: this.key });
    });
  }
}
