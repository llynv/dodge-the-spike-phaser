/**
 * 2D Vector class for representing points, positions, velocities, etc.
 */
export class Vec2 {
  constructor(public x: number = 0, public y: number = 0) {}

  /**
   * Create a new Vec2 with the same values
   */
  clone(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  /**
   * Add another vector to this one
   */
  add(v: Vec2): Vec2 {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  /**
   * Subtract another vector from this one
   */
  sub(v: Vec2): Vec2 {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  /**
   * Multiply this vector by a scalar
   */
  scale(s: number): Vec2 {
    this.x *= s;
    this.y *= s;
    return this;
  }

  /**
   * Get the magnitude (length) of this vector
   */
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Normalize this vector (make its length 1)
   */
  normalize(): Vec2 {
    const mag = this.magnitude();
    if (mag > 0) {
      this.x /= mag;
      this.y /= mag;
    }
    return this;
  }

  /**
   * Calculate the dot product with another vector
   */
  dot(v: Vec2): number {
    return this.x * v.x + this.y * v.y;
  }

  /**
   * Calculate the distance to another vector
   */
  distance(v: Vec2): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Linear interpolation between this vector and another
   * @param v Target vector
   * @param t Interpolation factor (0-1)
   */
  lerp(v: Vec2, t: number): Vec2 {
    this.x = this.x + (v.x - this.x) * t;
    this.y = this.y + (v.y - this.y) * t;
    return this;
  }

  addScaledVector(direction: Vec2, scale: number): Vec2 {
    return new Vec2(this.x + direction.x * scale, this.y + direction.y * scale);
  }

  /**
   * Create a Vec2 from an angle in radians
   * @param angle Angle in radians
   * @param length Length of the vector (default 1)
   */
  static fromAngle(angle: number, length: number = 1): Vec2 {
    return new Vec2(Math.cos(angle) * length, Math.sin(angle) * length);
  }

  /**
   * Create a Vec2 with a random direction
   * @param length Length of the vector (default 1)
   */
  static random(length: number = 1): Vec2 {
    return Vec2.fromAngle(Math.random() * Math.PI * 2, length);
  }

  /**
   * Calculate the angle of this vector in radians
   */
  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  /**
   * Set the values of this vector
   */
  set(x: number, y: number): Vec2 {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * Move towards a target vector
   * @param current Current vector
   * @param target Target vector
   * @param maxDistanceDelta Maximum distance to move
   * @returns New vector
   */
  static moveTowards(current: Vec2, target: Vec2, maxDistanceDelta: number): Vec2 {
    const toVectorX = target.x - current.x;
    const toVectorY = target.y - current.y;

    const sqDist = toVectorX * toVectorX + toVectorY * toVectorY;

    if (sqDist === 0 || (maxDistanceDelta >= 0 && sqDist <= maxDistanceDelta * maxDistanceDelta)) {
      return new Vec2(target.x, target.y);
    }

    const dist = Math.sqrt(sqDist);

    return new Vec2(
      current.x + (toVectorX / dist) * maxDistanceDelta,
      current.y + (toVectorY / dist) * maxDistanceDelta
    );
  }

  /**
   * Calculate the direction from one vector to another
   * @param from Starting vector
   * @param to Ending vector
   * @returns Normalized direction vector
   */
  static directionTo(from: Vec2, to: Vec2): Vec2 {
    return new Vec2(to.x - from.x, to.y - from.y).normalize();
  }

  /**
   * Move a vector forward in the direction of another vector
   * @param current Current vector
   * @param direction Direction vector
   * @param distanceDelta Distance to move
   * @returns New vector
   */
  static moveForward(current: Vec2, direction: Vec2, distanceDelta: number): Vec2 {
    const dirNorm = direction.normalize();
    return current.addScaledVector(dirNorm, distanceDelta);
  }

  static Zero: Vec2 = new Vec2(0, 0);
  static One: Vec2 = new Vec2(1, 1);
  static Up: Vec2 = new Vec2(0, 1);
  static Down: Vec2 = new Vec2(0, -1);
  static Left: Vec2 = new Vec2(-1, 0);
  static Right: Vec2 = new Vec2(1, 0);

  static equals(a: Vec2, b: Vec2): boolean {
    return a.x === b.x && a.y === b.y;
  }

  /**
   * Create a string representation of this vector
   */
  toString(): string {
    return `(${this.x}, ${this.y})`;
  }
}
