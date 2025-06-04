import { Vec2 } from './vec2';

/**
 * 3D Vector class for representing points, positions, etc.
 */
export class Vec3 {
  constructor(public x: number = 0, public y: number = 0, public z: number = 0) {}

  /**
   * Create a new Vec3 with the same values
   */
  clone(): Vec3 {
    return new Vec3(this.x, this.y, this.z);
  }

  /**
   * Add another vector to this one
   */
  add(v: Vec3): Vec3 {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  /**
   * Subtract another vector from this one
   */
  sub(v: Vec3): Vec3 {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  /**
   * Multiply this vector by a scalar
   */
  scale(s: number): Vec3 {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  /**
   * Get the magnitude (length) of this vector
   */
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  /**
   * Normalize this vector (make its length 1)
   */
  normalize(): Vec3 {
    const mag = this.magnitude();
    if (mag > 0) {
      this.x /= mag;
      this.y /= mag;
      this.z /= mag;
    }
    return this;
  }

  /**
   * Calculate the dot product with another vector
   */
  dot(v: Vec3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  /**
   * Calculate the cross product with another vector
   */
  cross(v: Vec3): Vec3 {
    const x = this.y * v.z - this.z * v.y;
    const y = this.z * v.x - this.x * v.z;
    const z = this.x * v.y - this.y * v.x;
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  /**
   * Calculate the distance to another vector
   */
  distance(v: Vec3): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    const dz = this.z - v.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Linear interpolation between this vector and another
   * @param v Target vector
   * @param t Interpolation factor (0-1)
   */
  lerp(v: Vec3, t: number): Vec3 {
    this.x = this.x + (v.x - this.x) * t;
    this.y = this.y + (v.y - this.y) * t;
    this.z = this.z + (v.z - this.z) * t;
    return this;
  }

  /**
   * Set the values of this vector
   */
  set(x: number, y: number, z: number): Vec3 {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  /**
   * Convert to Vec2 by dropping the z component
   */
  toVec2(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  /**
   * Create a string representation of this vector
   */
  toString(): string {
    return `(${this.x}, ${this.y}, ${this.z})`;
  }

  /**
   * Move towards a target vector
   * @param current Current vector
   * @param target Target vector
   * @param maxDistanceDelta Maximum distance to move
   * @returns New vector
   */
  static moveTowards(current: Vec3, target: Vec3, maxDistanceDelta: number): Vec3 {
    const toVectorX = target.x - current.x;
    const toVectorY = target.y - current.y;
    const toVectorZ = target.z - current.z;

    const sqDist = toVectorX * toVectorX + toVectorY * toVectorY + toVectorZ * toVectorZ;

    if (sqDist === 0 || (maxDistanceDelta >= 0 && sqDist <= maxDistanceDelta * maxDistanceDelta)) {
      return new Vec3(target.x, target.y, target.z);
    }

    const dist = Math.sqrt(sqDist);

    return new Vec3(
      current.x + (toVectorX / dist) * maxDistanceDelta,
      current.y + (toVectorY / dist) * maxDistanceDelta,
      current.z + (toVectorZ / dist) * maxDistanceDelta
    );
  }
}
