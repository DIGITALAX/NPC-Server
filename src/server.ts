import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import Phaser from "phaser";
import { INFURA_GATEWAY } from "./../lib/constants";
import RandomWalkerNPC from "./classes/RandomWalkerNPC";
import { GameScene } from "./types/src.types";

const parentWidth = 1512;
const parentHeight = 830;

class GameServer extends Phaser.Scene {
  private gameInstance!: Phaser.Game;
  private io: SocketIOServer;
  private frameCount: number;
  private npcs: RandomWalkerNPC[] = [];

  constructor() {
    super({ key: "GameServer" });
    const app = express();
    const httpServer = createServer(app);
    this.io = new SocketIOServer(httpServer);
    this.frameCount = 0;

    this.io.on("connection", (socket) => {
      console.log("User connected", socket.id);

      socket.on("setup", (config) => {
        console.log("Received setup config:", config);
        this.setupGame(config.width, config.height);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);
      });
    });

    httpServer.listen(3000, () => {
      console.log("Server listening on port 3000");
    });
  }

  preload(this: GameScene): void {
    this.load.image(
      "fondo",
      `${INFURA_GATEWAY}/ipfs/QmQho15EawdPjxhZ6QcnFoGHiEV8r2dTS1u7TczQv9cd44`
    );
    this.load.image(
      "pared",
      `${INFURA_GATEWAY}/ipfs/QmcR8PpyDhRaUzJJW5UoxhnyzqNk88imgXS2MGuhgfYsYK`
    );
    this.load.image(
      "nevera",
      `${INFURA_GATEWAY}/ipfs/QmaGoMNwYt7aEgG6AoKGmDdmWUQgshQ8KtASkgoHKgmcS2`
    );
    this.load.image(
      "maquina",
      `${INFURA_GATEWAY}/ipfs/QmVubKFGVcdfZS2pSEhmK8DtpFWbiC8H2BX11VPTd9xnNp`
    );
    this.load.image(
      "sofaUno",
      `${INFURA_GATEWAY}/ipfs/QmQfqKAD2Hepe9kQ9VxBSNmwZrywCvuPrnAr5AiF4bMvwB`
    );
    this.load.image(
      "sofaDos",
      `${INFURA_GATEWAY}/ipfs/QmUFsXQpp1ZZWKWCnHAED4pgZgeLSBnp4ofMz9ae1BkhAR`
    );
    this.load.image(
      "alfombra",
      `${INFURA_GATEWAY}/ipfs/QmQaZhrMnuwkKbP2UbYtnMxRiUcpZfNGyuEhGuqd7xcFAj`
    );
    this.load.image(
      "escritorio1",
      `${INFURA_GATEWAY}/ipfs/QmWtr9iRZ4HiPe1PBxrJfiB9hEQNa3GWxtipt7hqFvBPvs`
    );
    this.load.image(
      "silla1",
      `${INFURA_GATEWAY}/ipfs/QmariT81Kgxw4mNHCt8wGHmgH5avzrZt2r6vNiik4qeSwK`
    );
    this.load.image(
      "escritorio2",
      `${INFURA_GATEWAY}/ipfs/QmTwbtXhizeCxBbZk9Nbd3yrt67kcB7Ytm6sKAzx5rFtCd`
    );
    this.load.image(
      "silla2",
      `${INFURA_GATEWAY}/ipfs/Qmc8VyBMDALMJJknadELsL9SBQuYSuTHpa3e1SqfX61Egn`
    );
    this.load.image(
      "escritorio3",
      `${INFURA_GATEWAY}/ipfs/Qmcy6nTw4YaGj8AEtba2WVm8gYy1vj9LbyMNk9qGptz4ny`
    );
    this.load.image(
      "silla3",
      `${INFURA_GATEWAY}/ipfs/QmUuHUnrMHhusH1JrgG6WonoCUxG1t7LQe348gru2d4uHM`
    );
    this.load.image(
      "escritorio4",
      `${INFURA_GATEWAY}/ipfs/Qmd8VH1yPkPGtxoRM1bdAvLJnjyTG21pgswddCVnECxDHh`
    );
    this.load.image(
      "silla4",
      `${INFURA_GATEWAY}/ipfs/QmfZPky9neYWSuQcZ7wtyajqMCRPBaq7WiPjaab4ZxC8PZ`
    );
    this.load.image(
      "panelDeControl",
      `${INFURA_GATEWAY}/ipfs/QmWMPF4YYvRLGW4F76kufDSxg2LnYojDNZK7cfdkwQxdXw`
    );
    this.load.image(
      "arcade",
      `${INFURA_GATEWAY}/ipfs/QmaNMrJo7TqEpvsveTFJk7zwBbS4SukM3gnuVwhiY5sCoa`
    );
    this.load.image(
      "audio1",
      `${INFURA_GATEWAY}/ipfs/QmYrGLoU35kwH9HyVLi283hG2GzX1fbxuszHT3j1qfAs8G`
    );
    this.load.image(
      "audio2",
      `${INFURA_GATEWAY}/ipfs/QmQA2cgeuAMvLSqj75CWrhmNhKoQV2GKapy94Co6WmWQVi`
    );
    this.load.image(
      "planta1",
      `${INFURA_GATEWAY}/ipfs/QmXYg1FC5zTHXHP1czJmsusC9DT33JCwHnLacYAui1HH84`
    );
    this.load.image(
      "planta2",
      `${INFURA_GATEWAY}/ipfs/QmdcSwsasjt18R7Hey77X6idnW9qz25Q1XkVsHT7inqbm7`
    );
    this.load.image(
      "telefono",
      `${INFURA_GATEWAY}/ipfs/QmSz2dcSRdX9vtxpXH91dS4pe8PAkAakbwfb4mGZNwunkk`
    );
    this.load.image(
      "capsula",
      `${INFURA_GATEWAY}/ipfs/QmYjXKxmyRQHf6fDdqEaNPEdc3W7gcFuNxogsVL38kR3M9`
    );
    this.load.spritesheet(
      "muchacho",
      `${INFURA_GATEWAY}/ipfs/QmUHDrL3JTUMwztqyzr8cUdCjYLpjET9pRXrLTRPtfgSBx`,
      {
        frameWidth: 600,
        frameHeight: 600,
        margin: 0,
        startFrame: 0,
        endFrame: 143,
      }
    );
  }

  create(this: GameScene): void {
    const fondo = this.add.image(0, 0, "fondo").setOrigin(0, 0);
    fondo.displayWidth = parentWidth;
    fondo.displayHeight = parentHeight;
    const pared = this.physics.add
      .staticImage(fondo.width, 0, "pared")
      .setOrigin(0.62, 0)
      .setScale(1.1);
    pared.scaleX = 1.3;
    pared.body
      .setSize(pared.width, pared.height / 1.5, false)
      .setOffset(-0.5, 0);
    const nevera = this.physics.add
      .staticImage(0, 0, "nevera")
      .setOrigin(0, 0)
      .setScale(1.1);
    nevera.scaleX = 1.4;
    nevera.body
      .setSize(nevera.width * 2, nevera.height * 0.8, false)
      .setOffset(0, 0);
    const maquina = this.physics.add
      .staticImage(
        nevera.width + nevera.width / 2,
        nevera.height / 7,
        "maquina"
      )
      .setOrigin(0, 0)
      .setScale(1.1);
    maquina.scaleX = 1.6;
    maquina.body
      .setSize(maquina.width, maquina.height / 3, false)
      .setOffset(maquina.width, maquina.height / 5);
    const alfombra = this.add
      .image(fondo.width / 4, fondo.height / 2, "alfombra")
      .setOrigin(0, 0)
      .setScale(1.2);
    alfombra.scaleX = 1.5;
    const sofaUno = this.add
      .image(fondo.width / 1.5, pared.height / 1.4, "sofaUno")
      .setOrigin(0, 0)
      .setScale(1.2);
    const sofaDos = this.add
      .image(fondo.width / 0.9, pared.height / 1.4, "sofaDos")
      .setOrigin(0, 0)
      .setScale(1.2);

    const panelDeControl = this.physics.add
      .staticImage(
        Number(parentWidth),
        Number(parentHeight) / 1.1,
        "panelDeControl"
      )
      .setOrigin(1, 1);

    panelDeControl.body
      .setSize(pared.width / 3, pared.height, true)
      .setOffset(-pared.width / 6, -pared.height / 2);

    const escritorio1 = this.physics.add
      .staticImage(
        Number(parentWidth) - 20,
        Number(parentHeight) / 2.2,
        "escritorio1"
      )
      .setOrigin(1, 1);
    escritorio1.body
      .setSize(escritorio1.width, escritorio1.height, true)
      .setOffset(-escritorio1.width / 2, -escritorio1.height / 2);

    const silla1 = this.add
      .image(
        Number(escritorio1.x) - Number(escritorio1.width / 2.5),
        escritorio1.y,
        "silla1"
      )
      .setOrigin(1, 1);
    const escritorio2 = this.physics.add
      .staticImage(
        Number(parentWidth) - 20,
        Number(parentHeight) / 1.6,
        "escritorio2"
      )
      .setOrigin(1, 1);

    escritorio2.body
      .setSize(escritorio2.width, escritorio2.height, true)
      .setOffset(-escritorio2.width / 2, -escritorio2.height / 2);

    const silla2 = this.add
      .image(
        Number(escritorio2.x) - Number(escritorio2.width / 2.5),
        escritorio2.y,
        "silla2"
      )
      .setOrigin(1, 1);

    const escritorio3 = this.physics.add
      .staticImage(
        Number(parentWidth) - (escritorio1.width + 20),
        Number(parentHeight) / 2.2,
        "escritorio3"
      )
      .setOrigin(1, 1);
    escritorio3.body
      .setSize(escritorio3.width, escritorio3.height, true)
      .setOffset(-escritorio3.width / 2, -escritorio3.height / 2);

    const silla3 = this.add
      .image(
        Number(escritorio3.x) - Number(escritorio3.width / 2.5),
        escritorio3.y,
        "silla3"
      )
      .setOrigin(1, 1);

    const escritorio4 = this.physics.add
      .staticImage(
        Number(parentWidth) - (escritorio2.width + 20),
        Number(parentHeight) / 1.6,
        "escritorio4"
      )
      .setOrigin(1, 1);
    escritorio4.body
      .setSize(escritorio4.width, escritorio4.height, true)
      .setOffset(-escritorio4.width / 2, -escritorio4.height / 2);

    const silla4 = this.add
      .image(
        Number(escritorio4.x) - Number(escritorio4.width / 2.5),
        escritorio4.y,
        "silla4"
      )
      .setOrigin(1, 1);

    const arcade = this.physics.add
      .staticImage(Number(parentWidth), Number(parentHeight), "arcade")
      .setOrigin(1, 1)
      .setDepth(10000);
    const telefono = this.physics.add
      .staticImage(0, Number(parentHeight), "telefono")
      .setOrigin(0, 1)
      .setDepth(10000);
    telefono.body
      .setSize(telefono.width, telefono.height, false)
      .setOffset(0, -telefono.height / 2);
    const capsula = this.physics.add
      .staticImage(0, Number(parentHeight) - telefono.height, "capsula")
      .setOrigin(0, 1)
      .setDepth(10000);
    capsula.body
      .setSize(capsula.width, capsula.height, false)
      .setOffset(0, -capsula.height / 2);

    const audio1 = this.add
      .image(Number(parentWidth) / 2, Number(parentHeight), "audio1")
      .setOrigin(1, 1)
      .setDepth(10000);
    this.add
      .image(
        Number(parentWidth) / 2 + audio1.width,
        Number(parentHeight),
        "audio2"
      )
      .setOrigin(1, 1)
      .setDepth(10000);
    const planta1 = this.add
      .image(Number(parentWidth) / 2.5, Number(parentHeight), "planta1")
      .setOrigin(1, 1)
      .setDepth(10000);
    this.add
      .image(
        Number(parentWidth) / 2.5 - planta1.width,
        Number(parentHeight),
        "planta2"
      )
      .setOrigin(1, 1)
      .setDepth(10000);
    this.physics.world.bounds.width = parentWidth;
    this.physics.world.bounds.height = parentHeight;
    this.cameras.main.setBounds(0, 0, parentWidth, parentHeight);

    this.npcs.push(
      new RandomWalkerNPC(
        this,
        {
          texture: "muchacho",
          x: alfombra.x + alfombra.x / 2,
          y: alfombra.y + alfombra.y / 2,
        },
        [capsula, telefono, arcade, pared, nevera, maquina, sofaUno, sofaDos],
        [
          escritorio1,
          silla1,
          escritorio2,
          silla2,
          escritorio3,
          silla3,
          escritorio4,
          silla4,
          panelDeControl,
        ],
        [
          {
            obj: silla1,
            anim: "sentadoEscritorio",
            depth: true,
            adjustedX: 1330,
            adjustedY: 270,
          },
          {
            obj: silla2,
            anim: "sentadoEscritorio",
            depth: true,
            adjustedX: 1330,
            adjustedY: 430,
          },
          {
            obj: silla3,
            anim: "sentadoEscritorio",
            depth: true,
            adjustedX: 1000,
            adjustedY: 275,
          },
          {
            obj: silla4,
            anim: "sentadoEscritorio",
            depth: true,
            adjustedX: 1020,
            adjustedY: 430,
          },
          {
            obj: sofaUno,
            anim: "sentadoSofa",
            depth: false,
            adjustedX: 800,
            adjustedY: 220,
          },
          {
            obj: sofaDos,
            anim: "sentadoSofa",
            depth: false,
            adjustedX: 1240,
            adjustedY: 220,
          },
        ],
        [
          escritorio1,
          escritorio2,
          escritorio2,
          escritorio3,
          escritorio4,
          panelDeControl,
        ],
        true
      )
    );
  }

  update(this: GameScene): void {
    if (this.npcs.length > 0) {
      this.npcs.forEach((npc) => npc.update());
    }

    if (this.frameCount % 10 === 0) {
      this.game.renderer.snapshot((snapshot: any) => {
        const mapaDiv = document.getElementById("mapa");

        if (mapaDiv?.firstChild) {
          mapaDiv.replaceChild(snapshot, mapaDiv.firstChild);
        } else {
          mapaDiv?.appendChild(snapshot);
        }
        snapshot.draggable = false;
        mapaDiv!.style.overflow = "hidden";
        mapaDiv!.style.width = "100%";
        mapaDiv!.style.height = "100%";
      });
    }
    this.frameCount++;
  }

  setCameraTarget(newTexture: string) {
    this.npcs.forEach((npc) => {
      if (newTexture === npc.texture.key) {
        npc.makeCameraFollow();
      }
    });
  }

  private setupGame(configWidth: number, configHeight: number): void {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: configWidth,
      height: configHeight,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0, x: 0 },
          debug: true,
        },
      },
      scene: this,
      parent: "game-container",
    };
    this.gameInstance = new Phaser.Game(config);
  }
}

new GameServer();
