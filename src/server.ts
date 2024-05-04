import express from "express";
import { Server as SocketIOServer, Socket } from "socket.io";
import * as http from "http";
import { SCENE_LIST } from "./lib/constants.js";
import { Escena } from "./types/src.types.js";
import EscenaEstudio from "./classes/ConfigurarScene.js";
import "dotenv/config";
import dotenv from "dotenv";
import schedule from "node-schedule";

const app = express();
const server = http.createServer(app);
dotenv.config();

const io = new SocketIOServer(server, {
  cors: {
    origin: "https://npcstudio.xyz/",
    // origin: "*",
    methods: ["GET", "POST"],
    // allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

class NPCStudioEngine {
  private escenas: EscenaEstudio[] = [];
  constructor() {
    SCENE_LIST.forEach((escena: Escena) => {
      this.escenas.push(new EscenaEstudio(escena));
    });

    io.use((socket, next) => {
      if (
        socket.handshake.query.key &&
        socket.handshake.query.key === process.env.RENDER_KEY
      ) {
        next();
      } else {
        next(new Error("Authentication error"));
      }
    });

    io.on("connection", (socket: Socket) => {
      socket.on("enviarSceneIndex", (claveEscena: string) => {
        const scene = SCENE_LIST.find((e) => e.key == claveEscena);
        socket.emit("configurarEscena", {
          scene,
          state: this.escenas
            .find((e) => e.key == scene?.key)
            ?.npcs.map((npc) => npc.getState()),
        });
      });
    });
    this.enviarDatosPeriodicamente();
  }

  private enviarDatosPeriodicamente() {
    schedule.scheduleJob("*/2 * * * *", () => {
      this.escenas.forEach((escena) => {
        io.emit(
          escena.key,
          this.escenas
            .find((e) => e.key == escena.key)
            ?.npcs.map((npc) => npc.getState())
        );
      });
    });
  }
}

new NPCStudioEngine();

server.listen(process.env.PORT, () => {});
