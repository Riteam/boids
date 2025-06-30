import Utils from "./Utils"
/**
 * 2D vector
 */
class V2D {
  x: number;
  y: number;

  /**
   * Returns a new V2D from an array with components in [0] and [1]
   * @param {Array} v Array to copy
   * @returns {V2D}
   */
  static fromArray(array: [number, number] | number[]): V2D {
    return new V2D(array[0], array[1]);
  }

  /**
   * Returns a new V2D from an object with x and y properties
   * @param {Object} v Array to copy
   * @returns {V2D}
   */
  static fromObject(obj: { x: number; y: number }): V2D {
    return new V2D(obj.x, obj.y);
  }

  /**
   * Creates a random vector with a specified magnitude
   * @param {number} scale Magnitude of the random vector
   * @returns {V2D}
   */
  static random(scale: number = 1): V2D {
    const r = Utils.random() * 2.0 * Math.PI;
    return new V2D(Math.cos(r) * scale, Math.sin(r) * scale);
  }

  /**
   * Adds two vectors and returns the resultant
   * @param {V2D} a First vector
   * @param {V2D} b Second vector
   * @returns {V2D}
   */
  static add(a: V2D, b: V2D): V2D {
    return new V2D(a.x + b.x, a.y + b.y);
  }

  /**
   * Subtracts two vectors and returns the resultant
   * @param {V2D} a First vector
   * @param {V2D} b Second vector
   * @returns {V2D}
   */
  static sub(a: V2D, b: V2D): V2D {
    return new V2D(a.x - b.x, a.y - b.y);
  }

  /**
   * Multiplies a vector by a scalar value and returns the resultant
   * @param {V2D} v Vector
   * @param {number} scale Scale
   * @returns {V2D}
   */
  static mult(v: V2D, scale: number): V2D {
    return new V2D(v.x * scale, v.y * scale);
  }

  /**
   * Divides a vector by a scalar value and returns the resultant
   * @param {V2D} a Vector
   * @param {number} b Scale
   * @returns {V2D}
   */
  static div(v: V2D, scale: number): V2D {
    return new V2D(v.x / scale, v.y / scale);
  }

  /**
   * Create a new 2D vector
   * @param {number} x X component
   * @param {number} y Y component
   */
  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * Converts the vector to a string with the x and y components
   * @param {number} radix Specifies the radix for the components
   * @returns {string}
   */
  toString(radix: number = 10): string {
    return `${this.x.toString(radix)},${this.y.toString(radix)}`;
  }

  /**
   * Converts the vector to an array with components in [0] and [1]
   * @returns {Array}
   */
  toArray(): [number, number] {
    return [this.x, this.y];
  }

  /**
   * Converts the vector to a plain object
   * @returns {Object}
   */
  toObject(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /**
   * Set the components of the vector
   * @param {number} x X component
   * @param {number} y Y component
   * @returns {V2D}
   */
  set(x: number, y: number): V2D {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * Copies the given vector to this one
   * @param {V2D} v Given vector to copy
   * @returns {V2D}
   */
  copy(v: V2D): V2D {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  /**
   * Returns a new identical vector
   * @returns {V2D}
   */
  clone(): V2D {
    return new V2D(this.x, this.y);
  }

  // SCALAR PROPERTIES ----------------------------

  /**
   * Returns the angle of the vector in radians
   * @returns {number}
   */
  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  /**
   * Returns the squared magnitude of the vector
   * @returns {number}
   */
  sqrMag(): number {
    return this.x * this.x + this.y * this.y;
  }

  /**
   * Returns the magnitude of the vector
   * @returns {number}
   */
  mag(): number {
    return Math.hypot(this.x, this.y);
  }

  /**
   * Returns the squared distance between this vector and a given vector
   * @param {V2D} v Given vector
   * @returns {number}
   */
  sqrDist(v: V2D): number {
    const x = this.x - v.x,
      y = this.y - v.y;
    return x * x + y * y;
  }

  /**
   * Returns the distance between this vector and a given vector
   * @param {V2D} v Given vector
   * @returns {number}
   */
  dist(v: V2D): number {
    return Math.hypot(this.x - v.x, this.y - v.y);
  }

  /**
   * Returns the dot product between this vector and a given vector
   * @param {V2D} v Given vector
   * @returns {number}
   */
  dot(v: V2D): number {
    return v.x * this.x + v.y * this.y;
  }

  // UNARY -----------------------------------------

  isZero(): boolean {
    return this.x === 0 && this.y === 0;
  }

  /**
   * Sets the vector to 0
   * @returns {V2D}
   */
  zero(): V2D {
    this.x = 0;
    this.y = 0;
    return this;
  }

  /**
   * Sets the magnitude of the vector to 1
   * @returns {V2D}
   */
  normalize(): V2D {
    return this.setMag(1)
  }

  // SCALAR INPUT ----------------------------------

  /**
   * Randomizes the vector with a specified magnitude
   * @param {number} scale Magnitude of the random vector
   * @returns {V2D}
   */
  random(scale: number): V2D {
    const r = Utils.random() * 2.0 * Math.PI;
    this.x = Math.cos(r) * scale;
    this.y = Math.sin(r) * scale;
    return this;
  }

  /**
   * Rotates the vector by a given angle
   * @param {number} angle The angle to rotate the vector in radians
   * @returns {V2D}
   */
  rotate(angle: number): V2D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rx = this.x * cos - this.y * sin;
    this.y = this.x * sin + this.y * cos;
    this.x = rx;
    return this;
  }

  /**
   * Multiplies the vector by a given scale
   * @param {number} scale Factor to scale the vector
   * @returns {V2D}
   */
  mult(scale: number): V2D {
    this.x *= scale;
    this.y *= scale;
    return this;
  }

  /**
   * Divides the vector by a given scale
   * @param {number} scale Divisor to scale the vector
   * @returns {V2D}
   */
  div(scale: number): V2D {
    if (scale === 0) {
      throw new Error('scale is 0');
    }
    this.x /= scale;
    this.y /= scale;
    return this;
  }

  /**
   * Sets the vector's magnitude to a given scale
   * @param {number} mag Magnitude of the resulting vector
   * @returns {V2D}
   */
  setMag(mag: number): V2D {
    if (this.isZero())
      return this

    const ratio = mag / this.mag()
    return this.mult(ratio)
  }

  /**
   * Limits the vector's magnitude upwards to a given scale
   * @param {number} mag Maximum magnitude of the resulting vector
   * @returns {V2D}
   */
  max(mag: number): V2D {
    const l1 = this.sqrMag();
    const l2 = mag * mag;
    if (l1 <= l2) {
      return this;
    }
    this.setMag(mag);
    return this;
  }

  /**
   * Limits the vector's downwards to a given scale
   * @param {number} mag Minimum magnitude of the resulting vector
   * @returns {V2D}
   */
  min(mag: number): V2D {
    const l1 = this.sqrMag();
    const l2 = mag * mag;
    if (l1 >= l2) {
      return this;
    }
    this.setMag(mag);
    return this;
  }

  // VECTOR INPUT -----------------------------------

  /**
   * Adds the vector to a given vector
   * @param {V2D} v The vector to add
   * @returns {V2D}
   */
  add(v: V2D): V2D {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  /**
   * Subtracts a given vector from the vector
   * @param {V2D} v The vector to subtract
   * @returns {V2D}
   */
  sub(v: V2D): V2D {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  /**
   * Adds the vector to a given vector after multiplying the given vector by a given scale
   * @param {V2D} v The vector to scale and add
   * @param {number} scale The scaling factor
   * @returns {V2D}
   */
  sclAdd(v: V2D, scale: number): V2D {
    this.x += v.x * scale;
    this.y += v.y * scale;
    return this;
  }

  reflect(normal: V2D): V2D {
    const dot = this.dot(normal)
    return this.sub(normal.mult(2 * dot))
  }
}

export default V2D;
