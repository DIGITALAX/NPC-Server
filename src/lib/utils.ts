import { Direccion } from "types/src.types";

export const between = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const degToRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

export const distanceBetween = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

export const radToDeg = (radians: number): number => {
  return radians * (180 / Math.PI);
};
