class Vector2 {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  add(v: { x: number; y: number }) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  subtract(v: { x: number; y: number }) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  multiply(v: { x: number; y: number }) {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  }

  divide(v: { x: number; y: number }) {
    this.x /= v.x;
    this.y /= v.y;
    return this;
  }

  scale(scale: number) {
    this.x *= scale;
    this.y *= scale;
    return this;
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const len = this.length();
    if (len !== 0) {
      this.x /= len;
      this.y /= len;
    }
    return this;
  }

  distance(v: { x: number; y: number }): number {
    const dx = v.x - this.x;
    const dy = v.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  static angleBetween(
    v1: {
      x: number;
      y: number;
    },
    v2: {
      x: number;
      y: number;
    }
  ): number {
    return Math.atan2(v2.y - v1.y, v2.x - v1.x);
  }
}
