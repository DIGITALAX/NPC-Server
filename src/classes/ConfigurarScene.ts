import { Articulo, Escena, Objeto } from "./../types/src.types";
import RandomWalkerNPC from "./RandomWalkerNPC.js";

export default class EscenaEstudio {
  readonly key: string;
  npcs: RandomWalkerNPC[] = [];
  sillasOcupadas: number = 0;

  constructor(escena: Escena) {
    this.key = escena.key;
    this.npcs = escena.sprites.map((sprite) => {
      let avoidAll: (Objeto & {
          left: number;
          top: number;
          right: number;
          bottom: number;
        })[] = [],
        avoidFlex: (Articulo & {
          left: number;
          top: number;
          right: number;
          bottom: number;
        })[] = [];

      escena.evitar.map((obj) => {
        const halfWidth = obj.displayWidth / 2;
        const halfHeight = obj.displayHeight / 2;

        let coded = {
          ...obj,
          left: obj.x - halfWidth,
          top: obj.y - halfHeight,
          right: obj.x + halfWidth,
          bottom: obj.y + halfHeight,
        };

        avoidAll.push(coded);
      });

      escena.profundidad.map((obj) => {
        const halfWidth = obj.talla.x / 2;
        const halfHeight = obj.talla.y / 2;

        let coded = {
          ...obj,
          left: obj.sitio.x - halfWidth,
          top: obj.sitio.y - halfHeight,
          right: obj.sitio.x + halfWidth,
          bottom: obj.sitio.y + halfHeight,
        };

        avoidFlex.push(coded);
      });

      return new RandomWalkerNPC(
        sprite,
        this.sillasOcupadas,
        escena.sillas,
        avoidAll,
        avoidFlex,
        escena.world
      );
    });
  }
}
