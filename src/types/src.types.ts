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

export interface Escena {
  key: string;
  world: {
    width: number;
    height: number;
  };
  cover: string;
  prohibited: {
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
  profundidad: Articulo[];
  sillas: Seat[];
  fondo: {
    etiqueta: string;
    uri: string;
    displayWidth: number;
    displayHeight: number;
    sitio: {
      x: number;
      y: number;
    };
  };
  objects: Articulo[];
  sprites: Sprite[];
}

export interface Articulo {
  uri: string;
  etiqueta: string;
  sitio: {
    x: number;
    y: number;
  };
  escala: {
    x: number;
    y: number;
  };
  talla: {
    x: number;
    y: number;
  };
  profundidad?: number;
}

export interface Objeto {
  x: number;
  y: number;
  displayHeight: number;
  displayWidth: number;
}

export interface Seat {
  adjustedX: number;
  adjustedY: number;
  profundidad: boolean;
  depth?: number;
  anim: Direccion;
  etiqueta: string;
  sitio: {
    x: number;
    y: number;
  };
  talla: {
    x: number;
    y: number;
  };
  uri: string;
  escala: {
    x: number;
    y: number;
  };
  par?: string;
}

export interface Sprite {
  etiqueta: string;
  uri: string;
  x: number;
  y: number;
  displayHeight: number;
  displayWidth: number;
  frameWidth: number;
  frameHeight: number;
  margin: number;
  cover: string;
  startFrame: number;
  endFrame: number;
  maxMoves: number;
  escala: {
    x: number;
    y: number;
  };
}

export interface Estado {
  estado: Movimiento;
  puntosDeCamino: { x: number; y: number }[];
  duracion?: number;
  npcEtiqueta: string;
  randomSeat?: string;
}

export enum Movimiento {
  Move,
  Sit,
  Idle,
}
