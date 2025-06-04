export class GameManager {
  private static instance: GameManager | null = null;

  private isPaused: boolean = false;
  private isGameOver: boolean = false;
  private startTime: number = 0;
  private pauseTime: number = 0;
  private totalPauseTime: number = 0;
  private elapsedTime: number = 0;

  private pauseCallbacks: (() => void)[] = [];
  private resumeCallbacks: (() => void)[] = [];

  private constructor() {}

  public static getInstance(): GameManager {
    if (GameManager.instance === null) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  public getIsGameOver(): boolean {
    return this.isGameOver;
  }

  public startGame(): void {
    this.startTime = Date.now();
    this.totalPauseTime = 0;
    this.isGameOver = false;
    this.isPaused = false;
  }

  public getElapsedTime(): number {
    if (this.startTime === 0) return 0;

    const now = Date.now();
    let elapsed = now - this.startTime - this.totalPauseTime;

    if (this.isPaused && this.pauseTime > 0) {
      elapsed -= now - this.pauseTime;
    }

    return Math.max(0, elapsed);
  }

  public setIsPaused(isPaused: boolean): void {
    if (isPaused) {
      this.pause();
    } else {
      this.resume();
    }
  }

  private pause(): void {
    if (!this.isPaused && !this.isGameOver) {
      this.isPaused = true;
      this.pauseTime = Date.now();

      this.pauseCallbacks.forEach(callback => callback());
    }
  }

  private resume(): void {
    if (this.isPaused && !this.isGameOver) {
      this.isPaused = false;

      if (this.pauseTime > 0) {
        this.totalPauseTime += Date.now() - this.pauseTime;
        this.pauseTime = 0;
      }

      this.resumeCallbacks.forEach(callback => callback());
    }
  }

  public setElapsedTime(elapsedTime: number): void {
    this.elapsedTime = elapsedTime;
  }

  public setIsGameOver(gameOver: boolean): void {
    this.isGameOver = gameOver;
    if (gameOver) {
      this.isPaused = false;
    }
  }

  public addPauseCallback(callback: () => void): void {
    this.pauseCallbacks.push(callback);
  }

  public addResumeCallback(callback: () => void): void {
    this.resumeCallbacks.push(callback);
  }

  public removePauseCallback(callback: () => void): void {
    const index = this.pauseCallbacks.indexOf(callback);
    if (index !== -1) {
      this.pauseCallbacks.splice(index, 1);
    }
  }

  public removeResumeCallback(callback: () => void): void {
    const index = this.resumeCallbacks.indexOf(callback);
    if (index !== -1) {
      this.resumeCallbacks.splice(index, 1);
    }
  }

  public reset(): void {
    this.isPaused = false;
    this.isGameOver = false;
    this.startTime = 0;
    this.pauseTime = 0;
    this.totalPauseTime = 0;
  }
}
