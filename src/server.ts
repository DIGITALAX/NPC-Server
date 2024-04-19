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
  private frameDuration: number = 50;

  constructor() {
    this.globalNPC = new RandomWalkerNPC(0, 0, io);
    console.log("const");
    io.on("connection", (socket: Socket) => {
      console.log("connected");
      socket.emit("init", {
        direccion: this.globalNPC.animacion,
        direccionX: this.globalNPC.direction.x,
        direccionY: this.globalNPC.direction.y,
      });
    });
    this.startGameLoopWorker();
  }

  private startGameLoopWorker() {
    const gameLoopWorker = new Worker(new URL("gameLoop.js", import.meta.url));

    gameLoopWorker.on("message", (update: { deltaTime: number }) => {
      this.globalNPC.update(update.deltaTime);
    });

    gameLoopWorker.postMessage({
      type: "start",
      frameDuration: this.frameDuration,
      initialTime: Date.now(),
    });
  }
}

new NPCStudioEngine();

server.listen(3000, () => {
  console.log(`Servidor corriendo en http://localhost:3000`);
});
