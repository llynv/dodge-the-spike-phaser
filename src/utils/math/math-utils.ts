import { Vec2 } from './vec2';

/**
 * Math utility functions for game development
 */
export class MathUtils {
  /**
   * Convert degrees to radians
   * @param degrees Angle in degrees
   * @returns Angle in radians
   */
  static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert radians to degrees
   * @param radians Angle in radians
   * @returns Angle in degrees
   */
  static toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  /**
   * Clamp a value between min and max
   * @param value Value to clamp
   * @param min Minimum value
   * @param max Maximum value
   * @returns Clamped value
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Linear interpolation between two values
   * @param a Start value
   * @param b End value
   * @param t Interpolation factor (0-1)
   * @returns Interpolated value
   */
  static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /**
   * Smoothly interpolate between two values using a cubic function
   * @param a Start value
   * @param b End value
   * @param t Interpolation factor (0-1)
   * @returns Interpolated value
   */
  static smoothStep(a: number, b: number, t: number): number {
    t = MathUtils.clamp(t, 0, 1);
    t = t * t * (3 - 2 * t);
    return a + (b - a) * t;
  }

  /**
   * Generate a random number between min and max
   * @param min Minimum value
   * @param max Maximum value
   * @returns Random number between min and max
   */
  static random(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  /**
   * Generate a random integer between min and max (inclusive)
   * @param min Minimum value
   * @param max Maximum value
   * @returns Random integer between min and max (inclusive)
   */
  static randomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Return a random element from an array
   * @param array Array to select from
   * @returns Random element from the array
   */
  static randomElement<T>(array: T[]): T {
    return array[MathUtils.randomInt(0, array.length - 1)];
  }

  /**
   * Generate a random Vec2 within specified bounds
   * @param minX Minimum X value
   * @param maxX Maximum X value
   * @param minY Minimum Y value
   * @param maxY Maximum Y value
   * @returns Random Vec2
   */
  static randomVec2(minX: number, maxX: number, minY: number, maxY: number): Vec2 {
    return new Vec2(
      MathUtils.random(minX, maxX),
      MathUtils.random(minY, maxY)
    );
  }

  /**
   * Round a number to a specified number of decimal places
   * @param value Value to round
   * @param decimals Number of decimal places
   * @returns Rounded value
   */
  static round(value: number, decimals: number = 0): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }

  /**
   * Calculate the distance between two points
   * @param x1 First point X
   * @param y1 First point Y
   * @param x2 Second point X
   * @param y2 Second point Y
   * @returns Distance between the points
   */
  static distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate the angle between two points in radians
   * @param x1 First point X
   * @param y1 First point Y
   * @param x2 Second point X
   * @param y2 Second point Y
   * @returns Angle in radians
   */
  static angleBetween(x1: number, y1: number, x2: number, y2: number): number {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  /**
   * Map a value from one range to another
   * @param value Value to map
   * @param fromMin Input minimum
   * @param fromMax Input maximum
   * @param toMin Output minimum
   * @param toMax Output maximum
   * @returns Mapped value
   */
  static map(value: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number {
    return toMin + (toMax - toMin) * ((value - fromMin) / (fromMax - fromMin));
  }

  /**
   * Check if a value is approximately equal to another value
   * @param a First value
   * @param b Second value
   * @param epsilon Tolerance (default 0.0001)
   * @returns True if the values are approximately equal
   */
  static approximately(a: number, b: number, epsilon: number = 0.0001): boolean {
    return Math.abs(a - b) < epsilon;
  }
}
