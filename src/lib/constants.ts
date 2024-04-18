import { Seat } from "./../types/src.types.js";

export const INFURA_GATEWAY: string = "https://thedial.infura-ipfs.io";

export const SCENE_LIST: {
  key: string;
  seats: Seat[];
  sprite: {
    texture: string;
    x: number;
    y: number;
    displayHeight: number;
    displayWidth: number;
  }[];
  avoid: {
    x: number;
    y: number;
    displayHeight: number;
    displayWidth: number;
  }[];
}[] = [
  {
    key: "oficina",
    sprite: [
      {
        texture: "muchacho",
        x: 382.5,
        y: 576,
        displayHeight: 300,
        displayWidth: 300,
      },
    ],
    seats: [
      {
        depthCount: 0,
        anim: "sentadoEscritorio",
        depth: true,
        adjustedX: 1330,
        adjustedY: 270,
      },
      {
        depthCount: 0,
        anim: "sentadoEscritorio",
        depth: true,
        adjustedX: 1330,
        adjustedY: 430,
      },
      {
        depthCount: 0,
        anim: "sentadoEscritorio",
        depth: true,
        adjustedX: 1000,
        adjustedY: 275,
      },
      {
        depthCount: 0,
        anim: "sentadoEscritorio",
        depth: true,
        adjustedX: 1020,
        adjustedY: 430,
      },
      {
        depthCount: 0,
        anim: "sentadoSofa",
        depth: false,
        adjustedX: 800,
        adjustedY: 220,
      },
      {
        depthCount: 0,
        anim: "sentadoSofa",
        depth: false,
        adjustedX: 1240,
        adjustedY: 220,
      },
    ],
    avoid: [
      {
        x: 1492,
        y: 377.27272727272725,
        displayHeight: 186,
        displayWidth: 319,
      },
      {
        x: 1492,
        y: 518.75,
        displayHeight: 177,
        displayWidth: 307,
      },
      {
        x: 1173,
        y: 377.27272727272725,
        displayHeight: 165,
        displayWidth: 307,
      },
      {
        x: 1185,
        y: 518.75,
        displayHeight: 160,
        displayWidth: 307,
      },
      {
        x: 1512,
        y: 754.5454545454545,
        displayHeight: 228,
        displayWidth: 390,
      },
    ],
  },
];
