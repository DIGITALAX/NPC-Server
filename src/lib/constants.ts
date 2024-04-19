import { Seat } from "./../types/src.types.js";

export const INFURA_GATEWAY: string = "https://thedial.infura-ipfs.io";

export const SCENE_LIST: {
  key: string;
  seats: Seat[];
  world: {
    width: number;
    height: number;
  };
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
  obs: {
    x: number;
    y: number;
    displayHeight: number;
    displayWidth: number;
  }[];
}[] = [
  {
    key: "oficina",
    world: {
      height: 830,
      width: 1512,
    },
    sprite: [
      {
        texture: "muchacho",
        x: 382.5,
        y: 576,
        displayHeight: 300,
        displayWidth: 300,
      },
    ],
    obs: [
      {
        x: 0,
        y: 588,
        displayWidth: 95,
        displayHeight: 302,
      },
      {
        x: 0,
        y: 830,
        displayWidth: 86,
        displayHeight: 242,
      },
      {
        x: 1512,
        y: 830,
        displayWidth: 163,
        displayHeight: 267,
      },
      {
        x: 1020,
        y: 0,
        displayWidth: 1328.6000000000001,
        displayHeight: 224.4,
      },
      {
        x: 0,
        y: 0,
        displayWidth: 329,
        displayHeight: 408.1,
      },
      {
        x: 352.5,
        y: 53,
        displayWidth: 169.60000000000002,
        displayHeight: 247.50000000000003,
      },
      {
        x: 680,
        y: 145.71428571428572,
        displayWidth: 236.39999999999998,
        displayHeight: 128.4,
      },
      {
        x: 1133.3333333333333,
        y: 145.71428571428572,
        displayWidth: 232.79999999999998,
        displayHeight: 130.79999999999998,
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
