import RandomWalkerNPC from "./classes/RandomWalkerNPC.js";
import express from "express";
import { Server as SocketIOServer } from "socket.io";
import * as http from "http";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server);

class NPCStudioEngine {
  private globalNPC!: RandomWalkerNPC;
  private lastUpdateTime: number = Date.now();
  private frameDuration: number = 50;

  constructor() {
    this.globalNPC = new RandomWalkerNPC(0, 0, io);
    this.runGameLoop();
  }

  runGameLoop() {
    const updateGame = () => {
      const now = Date.now();
      const deltaTime = now - this.lastUpdateTime;
      if (deltaTime >= this.frameDuration) {
        this.globalNPC.update(deltaTime);
        this.lastUpdateTime = now - (deltaTime % this.frameDuration);
      }
      process.nextTick(updateGame);
    };

    updateGame();
  }

  onJoin() {
    io.emit("init", {
      direccion: this.globalNPC.animacion,
      direccionX: this.globalNPC.direction.x,
      direccionY: this.globalNPC.direction.y,
    });
  }
}

new NPCStudioEngine();

server.listen(3001, () => {
  console.log(`Servidor corriendo en http://localhost:3001`);
});
