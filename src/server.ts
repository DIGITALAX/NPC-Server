import express from "express";
import { Server as SocketIOServer, Socket } from "socket.io";
import * as http from "http";
import { SCENE_LIST } from "./lib/constants.js";
import { Escena, Estado } from "./types/src.types.js";
import EscenaEstudio from "./classes/ConfigurarEscena.js";
import "dotenv/config";
import dotenv from "dotenv";
import { Worker } from "worker_threads";

const app = express();
const server = http.createServer(app);
dotenv.config();

const io = new SocketIOServer(server, {
  cors: {
    // origin: "*",
    
    origin: "https://npcstudio.xyz",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

class NPCStudioEngine {
  private escenas: EscenaEstudio[] = [];
  private gameWorker: Worker;

  constructor() {
    this.gameWorker = new Worker(new URL("./gameLoop.js", import.meta.url), {
      resourceLimits: {
        maxOldGenerationSizeMb: 2048,
        maxYoungGenerationSizeMb: 1024,
      },
    });
    this.gameWorker.setMaxListeners(20);

    SCENE_LIST.forEach((escena: Escena) => {
      this.escenas.push(new EscenaEstudio(escena, this.gameWorker));
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
        const escena = this.escenas.find((e) => e.key == claveEscena);

        if (escena) {
          escena
            .requestState()
            .then(
              (state: { cmd: string; key: string; estados: Estado[][] }) => {
                socket.emit("configurarEscena", {
                  scene: SCENE_LIST.find((e) => e.key == claveEscena),
                  state: state?.estados,
                });
              }
            );
        }
      });

      socket.on("datosDeEscena", (claveEscena: string) => {
        const escena = this.escenas.find((e) => e.key == claveEscena);

        if (escena) {
          escena
            .requestState()
            .then(
              (state: { cmd: string; key: string; estados: Estado[][] }) => {
                if (state?.key && state?.estados?.length > 0) {
                  io.emit(state.key, state.estados);
                }
              }
            );
        }
      });
    });
  }
}
new NPCStudioEngine();

server.listen(process.env.PORT, () => {});
