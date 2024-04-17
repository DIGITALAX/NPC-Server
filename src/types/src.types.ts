import { Server as SocketIOServer } from "socket.io";
import RandomWalkerNPC from "../classes/RandomWalkerNPC";

export enum Direccion {
  Izquierda = "izquierda",
  Derecha = "derecha",
  Arriba = "arriba",
  Abajo = "abajo",
  IzquierdaArriba = "izquierdaArriba",
  IzquierdaAbajo = "izquierdaAbajo",
  DerechaArriba = "derechaArriba",
  DerechaAbajo = "derechaAbajo",
  Inactivo = "inactivo",
  Sofa = "sentadoSofa",
  Silla = "sentadoEscritorio",
}

export interface Seat {
  obj: Phaser.GameObjects.Image;
  anim: string;
  depth: boolean;
  adjustedX: number;
  adjustedY: number;
}

export interface GameScene extends Phaser.Scene {
  gameInstance: Phaser.Game;
  io: SocketIOServer;
  frameCount: number;
  npcs: RandomWalkerNPC[];
}
