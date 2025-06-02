/**
 * Rectangle class for representing rectangles or bounds
 */
export class Rect {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public width: number = 0,
    public height: number = 0
  ) { }

  /**
   * Get the left edge of the rectangle
   */
  get left(): number {
    return this.x;
  }

  /**
   * Get the right edge of the rectangle
   */
  get right(): number {
    return this.x + this.width;
  }

  /**
   * Get the top edge of the rectangle
   */
  get top(): number {
    return this.y;
  }

  /**
   * Get the bottom edge of the rectangle
   */
  get bottom(): number {
    return this.y + this.height;
  }

  /**
   * Check if this rectangle contains a point
   */
  contains(x: number, y: number): boolean {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }

  /**
   * Check if this rectangle intersects another rectangle
   */
  intersects(rect: Rect): boolean {
    return !(
      this.right < rect.left ||
      this.left > rect.right ||
      this.bottom < rect.top ||
      this.top > rect.bottom
    );
  }

  /**
   * Create a new Rect with the same values
   */
  clone(): Rect {
    return new Rect(this.x, this.y, this.width, this.height);
  }

  /**
   * Create a string representation of this rectangle
   */
  toString(): string {
    return `Rect(${this.x}, ${this.y}, ${this.width}, ${this.height})`;
  }
}

