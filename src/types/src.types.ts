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
  evitar: {
    x: number;
    y: number;
    displayHeight: number;
    displayWidth: number;
  }[];
  profundidad: {
    x: number;
    y: number;
    displayHeight: number;
    displayWidth: number;
  }[];
  fondo: {
    etiqueta: string;
    uri: string;
    displayWidth: number;
    displayHeight: number;
    origen: {
      x: number;
      y: number;
    };
    sitio: {
      x: number;
      y: number;
    };
  };
  objects: {
    uri: string;
    etiqueta: string;
    sitio: {
      x: number;
      y: number;
    };
    origen: {
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
    depth: number;
    seatInfo?: {
      adjustedX: number;
      adjustedY: number;
      depthCount: number;
      anim: Direccion;
      depth: boolean;
      texture: string;
    };
    profound?: boolean;
  }[];
  sprites: Sprite[];
}

export interface Objeto {
  x: number;
  y: number;
  displayHeight: number;
  displayWidth: number;
  all?: boolean | undefined;
}

export interface Seat {
  adjustedX: number;
  adjustedY: number;
  depthCount: number;
  anim: Direccion;
  depth: boolean;
  texture: string;
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
  startFrame: number;
  endFrame: number;
  origen: {
    x: number;
    y: number;
  };
  escala: {
    x: number;
    y: number;
  };
}
