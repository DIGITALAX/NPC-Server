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
          } else if (item?.avoid !== null && item?.avoid !== undefined) {
            const halfWidth = item.avoid.displayWidth / 2;
            const halfHeight = item.avoid.displayHeight / 2;

            let coded = {
              ...item?.avoid,
              left: item.avoid.x - halfWidth,
              top: item.avoid.y - halfHeight,
              right: item.avoid.x + halfWidth,
              bottom: item.avoid.y + halfHeight,
            };

            if (item.avoid?.all) {
              avoidAll.push(coded);
            } else {
              avoidFlex.push(coded);
            }
          } else {
            return false;
          }
        })
        ?.filter(Boolean);

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
