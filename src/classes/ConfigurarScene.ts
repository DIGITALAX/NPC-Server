import { Escena, Objeto, Seat } from "./../types/src.types";
import RandomWalkerNPC from "./RandomWalkerNPC.js";

export default class EscenaEstudio {
  readonly key: string;
  npcs: RandomWalkerNPC[] = [];
  sillasOcupadas: number = 0;

  constructor(escena: Escena) {
    this.key = escena.key;
    this.npcs = escena.sprites.map((sprite) => {
      let seats: Seat[] = [],
        avoidAll: (Objeto & {
          left: number;
          top: number;
          right: number;
          bottom: number;
        })[] = [],
        avoidFlex: (Objeto & {
          left: number;
          top: number;
          right: number;
          bottom: number;
        })[] = [];

      escena.objects
        .map((item) => {
          if (item?.seatInfo !== null && item?.seatInfo !== undefined) {
            seats.push(item.seatInfo);
          } else {
            return false;
          }
        })
        ?.filter(Boolean);

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
        const halfWidth = obj.displayWidth / 2;
        const halfHeight = obj.displayHeight / 2;

        let coded = {
          ...obj,
          left: obj.x - halfWidth,
          top: obj.y - halfHeight,
          right: obj.x + halfWidth,
          bottom: obj.y + halfHeight,
        };

        avoidFlex.push(coded);
      });

      return new RandomWalkerNPC(
        sprite,
        this.sillasOcupadas,
        seats,
        avoidAll,
        avoidFlex,
        escena.world
      );
    });
  }
}
