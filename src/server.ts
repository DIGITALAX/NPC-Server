import RandomWalkerNPC from "./classes/RandomWalkerNPC.js";
import express from "express";
import { Server as SocketIOServer, Socket } from "socket.io";
import * as http from "http";
import { Worker } from "worker_threads";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

class NPCStudioEngine {
  private globalNPC!: RandomWalkerNPC;

  constructor() {
    this.globalNPC = new RandomWalkerNPC(0, 0, io);
    io.on("connection", (socket: Socket) => {
      socket.emit("update", this.globalNPC.getState());
      this.globalNPC.registerClient(socket);

      socket.on("disconnect", () => {
        this.globalNPC.unregisterClient(socket);
      });
    });
    this.startGameLoopWorker();
  }

  private startGameLoopWorker() {
    const gameLoopWorker = new Worker(new URL("gameLoop.js", import.meta.url));

    gameLoopWorker.on("message", (update: { deltaTime: number }) => {
      this.globalNPC.update(update.deltaTime);
      io.emit("direccionCambio", this.globalNPC.getState());
    });

    gameLoopWorker.postMessage({
      cmd: "start",
    });
  }
}

new NPCStudioEngine();

server.listen(3000, () => {
  console.log(`Servidor corriendo en http://localhost:3000`);
});
