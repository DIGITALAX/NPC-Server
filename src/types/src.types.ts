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

export enum Estado {
  Sentado = "sentado",
  Inactivo = "inactivo",
  Moverse = "moverse",
}

export interface Seat {
  texture: string | undefined;
  depthCount: number | undefined;
  anim: Direccion | undefined;
  depth: boolean | undefined;
  adjustedX: number | undefined;
  adjustedY: number | undefined;
}
