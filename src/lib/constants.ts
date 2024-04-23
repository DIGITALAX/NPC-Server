import { Direccion, Escena } from "./../types/src.types.js";

export const INFURA_GATEWAY: string = "https://thedial.infura-ipfs.io";

export const SCENE_LIST: Escena[] = [
  {
    key: "oficina",
    world: {
      height: 830,
      width: 1512,
    },
    fondo: {
      uri: "QmQho15EawdPjxhZ6QcnFoGHiEV8r2dTS1u7TczQv9cd44",
      etiqueta: "fondo",
      origen: {
        x: 0,
        y: 0,
      },
      displayHeight: 830,
      displayWidth: 1512,
      sitio: {
        x: 0,
        y: 0,
      },
    },
    objects: [
      {
        etiqueta: "pared",
        sitio: {
          x: 850,
          y: 110,
        },
        depth: 0,
        talla: {
          x: 1022,
          y: 204,
        },
        uri: "QmcR8PpyDhRaUzJJW5UoxhnyzqNk88imgXS2MGuhgfYsYK",
        origen: {
          x: 0.5,
          y: 0.5,
        },
        escala: {
          x: 1.3,
          y: 1.1,
        },
        centro: false,
        fisica: true,
        offset: {
          x: 0,
          y: 0,
        },
        avoid: {
          x: 339,
          y: 8,
          displayHeight: 44.88,
          displayWidth: 1965.6000000000001,
          all: true,
        },
      },
      {
        etiqueta: "nevera",
        depth: 0,
        sitio: {
          x: 145,
          y: 205,
        },
        talla: {
          x: 235,
          y: 371,
        },
        uri: "QmaGoMNwYt7aEgG6AoKGmDdmWUQgshQ8KtASkgoHKgmcS2",
        origen: {
          x: 0.5,
          y: 0.5,
        },
        escala: {
          x: 1.3,
          y: 1.1,
        },
        centro: false,
        fisica: true,
        offset: {
          x: 0,
          y: 0,
        },
        avoid: {
          x: 20,
          y: 19.5,
          displayHeight: 120.025,
          displayWidth: 400,
        },
      },
      {
        etiqueta: "maquina",
        depth: 0,
        sitio: {
          x: 470,
          y: 200,
        },
        talla: {
          x: 106,
          y: 225,
        },
        uri: "QmVubKFGVcdfZS2pSEhmK8DtpFWbiC8H2BX11VPTd9xnNp",
        origen: {
          x: 0.5,
          y: 0.5,
        },
        escala: {
          x: 1.6,
          y: 1.1,
        },
        fisica: true,
        centro: false,
        offset: {
          x: 0,
          y: -60,
        },
        avoid: {
          x: 390,
          y: 27.5,
          displayHeight: 120,
          displayWidth: 220,
          all: true,
        },
      },
      {
        etiqueta: "sofaUno",
        depth: 0,
        sitio: {
          x: 680,
          y: 145.71428571428572,
        },
        talla: {
          x: 197,
          y: 107,
        },
        uri: "QmQfqKAD2Hepe9kQ9VxBSNmwZrywCvuPrnAr5AiF4bMvwB",
        origen: {
          x: 0,
          y: 0,
        },
        escala: {
          x: 1.2,
          y: 1.2,
        },
        fisica: false,
        centro: false,
        offset: {
          x: 0,
          y: 0,
        },
        seatInfo: {
          depthCount: 0,
          anim: Direccion.Sofa,
          depth: false,
          adjustedX: 820,
          adjustedY: 220,
          texture: "sofaUno",
        },
      },
      {
        etiqueta: "sofaDos",
        depth: 0,
        sitio: {
          x: 1153.3333333333333,
          y: 145.71428571428572,
        },
        talla: {
          x: 194,
          y: 109,
        },
        uri: "QmUFsXQpp1ZZWKWCnHAED4pgZgeLSBnp4ofMz9ae1BkhAR",
        origen: {
          x: 0,
          y: 0,
        },
        escala: {
          x: 1.2,
          y: 1.2,
        },
        fisica: false,
        centro: false,
        offset: {
          x: 0,
          y: 0,
        },
        seatInfo: {
          depthCount: 0,
          anim: Direccion.Sofa,
          depth: false,
          adjustedX: 1250,
          adjustedY: 220,
          texture: "sofaDos",
        },
      },
      {
        etiqueta: "alfombra",
        depth: 0,
        sitio: {
          x: 255,
          y: 384,
        },
        talla: {
          x: 246,
          y: 179,
        },
        uri: "QmQaZhrMnuwkKbP2UbYtnMxRiUcpZfNGyuEhGuqd7xcFAj",
        origen: {
          x: 0,
          y: 0,
        },
        escala: {
          x: 1.5,
          y: 1.2,
        },
        fisica: false,
        centro: false,
        offset: {
          x: 0,
          y: 0,
        },
      },
      {
        etiqueta: "escritorio1",
        depth: 0.1,
        sitio: {
          x: 1342,
          y: 310,
        },
        talla: {
          x: 319,
          y: 186,
        },
        uri: "QmWtr9iRZ4HiPe1PBxrJfiB9hEQNa3GWxtipt7hqFvBPvs",
        origen: {
          x: 0.5,
          y: 0.5,
        },
        escala: {
          x: 1,
          y: 1,
        },
        fisica: true,
        centro: true,
        offset: {
          x: 0,
          y: 0,
        },
        profound: true,

        avoid: {
          x: 1018.5,
          y: 440,
          displayWidth: 307,
          displayHeight: 160,
        },
      },
      {
        etiqueta: "silla1",
        depth: 0.2,
        sitio: {
          x: 1322,
          y: 325,
        },
        talla: {
          x: 92,
          y: 116,
        },
        uri: "QmariT81Kgxw4mNHCt8wGHmgH5avzrZt2r6vNiik4qeSwK",
        origen: {
          x: 0.5,
          y: 0.5,
        },
        escala: {
          x: 1,
          y: 1,
        },
        fisica: false,
        centro: false,
        offset: {
          x: 0,
          y: 0,
        },
        seatInfo: {
          depthCount: 0,
          anim: Direccion.Silla,
          depth: true,
          adjustedX: 1330,
          adjustedY: 260,
          texture: "silla1",
        },
        profound: true,
      },
      {
        etiqueta: "escritorio2",
        depth: 0.3,
        sitio: {
          x: 1342,
          y: 430,
        },
        talla: {
          x: 307,
          y: 177,
        },
        uri: "QmTwbtXhizeCxBbZk9Nbd3yrt67kcB7Ytm6sKAzx5rFtCd",
        origen: {
          x: 0.5,
          y: 0.5,
        },
        escala: {
          x: 1,
          y: 1,
        },
        fisica: true,
        centro: true,
        offset: {
          x: 0,
          y: 0,
        },
        profound: true,
        avoid: {
          x: 1342,
          y: 430,
          displayWidth: 307,
          displayHeight: 177,
        },
      },
      {
        etiqueta: "silla2",
        depth: 0.4,
        sitio: {
          x: 1322,
          y: 470,
        },
        talla: {
          x: 89,
          y: 109,
        },
        uri: "Qmc8VyBMDALMJJknadELsL9SBQuYSuTHpa3e1SqfX61Egn",
        origen: {
          x: 0.5,
          y: 0.5,
        },
        escala: {
          x: 1,
          y: 1,
        },
        fisica: false,
        centro: false,
        offset: {
          x: 0,
          y: 0,
        },
        seatInfo: {
          depthCount: 0,
          anim: Direccion.Silla,
          depth: true,
          adjustedX: 1330,
          adjustedY: 480,
          texture: "silla2",
        },
        profound: true,
      },
      {
        etiqueta: "escritorio3",
        depth: 0.1,
        sitio: {
          x: 1012.5,
          y: 310,
        },
        talla: {
          x: 307,
          y: 165,
        },
        uri: "Qmcy6nTw4YaGj8AEtba2WVm8gYy1vj9LbyMNk9qGptz4ny",
        origen: {
          x: 0.5,
          y: 0.5,
        },
        escala: {
          x: 1,
          y: 1,
        },
        fisica: true,
        centro: true,
        offset: {
          x: 0,
          y: 0,
        },
        profound: true,
        avoid: {
          x: 1342,
          y: 310,
          displayWidth: 319,
          displayHeight: 186,
        },
      },
      {
        etiqueta: "silla3",
        depth: 0.2,
        sitio: {
          x: 992.5,
          y: 325,
        },
        talla: {
          x: 100,
          y: 108,
        },
        uri: "QmUuHUnrMHhusH1JrgG6WonoCUxG1t7LQe348gru2d4uHM",
        origen: {
          x: 0.5,
          y: 0.5,
        },
        escala: {
          x: 1,
          y: 1,
        },
        fisica: false,
        centro: false,
        offset: {
          x: 0,
          y: 0,
        },
        seatInfo: {
          depthCount: 0,
          anim: Direccion.Silla,
          depth: true,
          adjustedX: 1000,
          adjustedY: 265,
          texture: "silla3",
        },
        profound: true,
      },
      {
        etiqueta: "escritorio4",
        depth: 0.3,
        sitio: {
          x: 1018.5,
          y: 440,
        },
        talla: {
          x: 307,
          y: 160,
        },
        uri: "Qmd8VH1yPkPGtxoRM1bdAvLJnjyTG21pgswddCVnECxDHh",
        origen: {
          x: 0.5,
          y: 0.5,
        },
        escala: {
          x: 1,
          y: 1,
        },
        fisica: true,
        centro: true,
        offset: {
          x: 0,
          y: 0,
        },
        profound: true,
        avoid: {
          x: 1012.5,
          y: 340,
          displayWidth: 307,
          displayHeight: 165,
        },
      },
      {
        uri: "QmfZPky9neYWSuQcZ7wtyajqMCRPBaq7WiPjaab4ZxC8PZ",
        etiqueta: "silla4",
        depth: 0.4,
        sitio: {
          x: 998.5,
          y: 485,
        },
        talla: {
          x: 98,
          y: 103,
        },
        origen: {
          x: 0.5,
          y: 0.5,
        },
        escala: {
          x: 1,
          y: 1,
        },
        fisica: false,
        centro: false,
        offset: {
          x: 0,
          y: 0,
        },
        seatInfo: {
          depthCount: 0,
          anim: Direccion.Silla,
          depth: true,
          adjustedX: 1020,
          adjustedY: 460,
          texture: "silla4",
        },
        profound: true,
      },
      {
        etiqueta: "panelDeControl",
        depth: 0.5,
        uri: "QmWMPF4YYvRLGW4F76kufDSxg2LnYojDNZK7cfdkwQxdXw",
        origen: {
          x: 0.5,
          y: 0.5,
        },
        escala: {
          x: 1,
          y: 1,
        },
        sitio: { x: 1320, y: 630 },
        fisica: true,
        centro: true,
        offset: {
          x: 0,
          y: 0,
        },
        talla: { x: 390, y: 228 },
        profound: true,
        avoid: {
          x: 1302,
          y: 630,
          displayWidth: 390,
          displayHeight: 228,
        },
      },
      {
        etiqueta: "arcade",
        depth: 10000,
        sitio: {
          x: 1442,
          y: 700,
        },
        avoid: {
          x: 1340.5,
          y: 566.5,
          displayHeight: 267,
          displayWidth: 163,
          all: true,
        },
        talla: {
          x: 163,
          y: 267,
        },
        uri: "QmaNMrJo7TqEpvsveTFJk7zwBbS4SukM3gnuVwhiY5sCoa",
        origen: {
          x: 0.5,
          y: 0.5,
        },
        escala: {
          x: 1,
          y: 1,
        },
        fisica: true,
        centro: false,
        offset: {
          x: 0,
          y: 0,
        },
      },
      {
        etiqueta: "audio1",
        depth: 10000,
        sitio: {
          x: 756,
          y: 830,
        },
        talla: {
          x: 160,
          y: 117,
        },
        uri: "QmYrGLoU35kwH9HyVLi283hG2GzX1fbxuszHT3j1qfAs8G",
        origen: {
          x: 1,
          y: 1,
        },
        escala: {
          x: 1,
          y: 1,
        },
        fisica: false,
        centro: false,
        offset: {
          x: 0,
          y: 0,
        },
      },
      {
        etiqueta: "audio2",
        depth: 10000,
        sitio: {
          x: 916,
          y: 830,
        },
        talla: {
          x: 160,
          y: 131,
        },
        uri: "QmQA2cgeuAMvLSqj75CWrhmNhKoQV2GKapy94Co6WmWQVi",
        origen: {
          x: 1,
          y: 1,
        },
        escala: {
          x: 1,
          y: 1,
        },
        fisica: false,
        centro: false,
        offset: {
          x: 0,
          y: 0,
        },
      },
      {
        etiqueta: "planta1",
        depth: 10000,
        sitio: {
          x: 604.8,
          y: 830,
        },
        talla: {
          x: 97,
          y: 84,
        },
        uri: "QmXYg1FC5zTHXHP1czJmsusC9DT33JCwHnLacYAui1HH84",
        origen: {
          x: 1,
          y: 1,
        },
        escala: {
          x: 1,
          y: 1,
        },
        fisica: false,
        centro: false,
        offset: {
          x: 0,
          y: 0,
        },
      },
      {
        etiqueta: "planta2",
        depth: 10000,
        sitio: {
          x: 507.79999999999995,
          y: 830,
        },
        talla: {
          x: 75,
          y: 104,
        },
        uri: "QmdcSwsasjt18R7Hey77X6idnW9qz25Q1XkVsHT7inqbm7",
        origen: {
          x: 1,
          y: 1,
        },
        escala: {
          x: 1,
          y: 1,
        },
        fisica: false,
        centro: false,
        offset: {
          x: 0,
          y: 0,
        },
      },
      {
        etiqueta: "capsula",
        depth: 10000,
        sitio: {
          x: 50,
          y: 468,
        },
        talla: {
          x: 95,
          y: 302,
        },
        uri: "QmYjXKxmyRQHf6fDdqEaNPEdc3W7gcFuNxogsVL38kR3M9",
        origen: {
          x: 0.5,
          y: 0.5,
        },
        escala: {
          x: 1,
          y: 1,
        },
        fisica: true,
        centro: false,
        offset: {
          x: 0,
          y: 0,
        },

        avoid: {
          x: 2.5,
          y: 317,
          displayHeight: 302,
          displayWidth: 95,
          all: true,
        },
      },
      {
        etiqueta: "telefono",

        avoid: {
          x: 7,
          y: 589,
          displayHeight: 242,
          displayWidth: 86,
          all: true,
        },
        depth: 10000,
        sitio: {
          x: 50,
          y: 710,
        },
        talla: {
          x: 86,
          y: 242,
        },
        uri: "QmSz2dcSRdX9vtxpXH91dS4pe8PAkAakbwfb4mGZNwunkk",
        origen: {
          x: 0.5,
          y: 0.5,
        },
        escala: {
          x: 1,
          y: 1,
        },
        fisica: true,
        centro: false,
        offset: {
          x: 0,
          y: 0,
        },
      },
    ],
    sprites: [
      {
        etiqueta: "muchacho",
        uri: "QmUHDrL3JTUMwztqyzr8cUdCjYLpjET9pRXrLTRPtfgSBx",
        x: 382.5,
        y: 576,
        displayHeight: 600,
        displayWidth: 300,
        frameWidth: 600,
        frameHeight: 600,
        margin: 0,
        startFrame: 0,
        endFrame: 143,
        escala: {
          x: 0.5,
          y: 0.5,
        },
        origen: {
          x: 0.5,
          y: 0.5,
        },
        centro: true,
      },
    ],
  },
];
