export class GameManager {
  private static _instance: GameManager | null = null;

  // Game state
  private _isPaused: boolean = false;
  private _isGameOver: boolean = false;
  private _startTime: number = 0;
  private _pauseTime: number = 0;
  private _totalPauseTime: number = 0;
  private _elapsedTime: number = 0;

  // Callbacks
  private _pauseCallbacks: (() => void)[] = [];
  private _resumeCallbacks: (() => void)[] = [];

  private constructor() {
    // Private constructor for singleton
  }

  public static get instance(): GameManager {
    if (GameManager._instance === null) {
      GameManager._instance = new GameManager();
    }
    return GameManager._instance;
  }

  public get isPaused(): boolean {
    return this._isPaused;
  }

  public get isGameOver(): boolean {
    return this._isGameOver;
  }

  public startGame(): void {
    this._startTime = Date.now();
    this._totalPauseTime = 0;
    this._isGameOver = false;
    this._isPaused = false;
  }

  public getElapsedTime(): number {
    if (this._startTime === 0) return 0;

    const now = Date.now();
    let elapsed = now - this._startTime - this._totalPauseTime;

    if (this._isPaused && this._pauseTime > 0) {
      elapsed -= (now - this._pauseTime);
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

  public pause(): void {
    if (!this._isPaused && !this._isGameOver) {
      this._isPaused = true;
      this._pauseTime = Date.now();

      this._pauseCallbacks.forEach(callback => callback());
    }
  }

  public resume(): void {
    if (this._isPaused && !this._isGameOver) {
      this._isPaused = false;

      if (this._pauseTime > 0) {
        this._totalPauseTime += Date.now() - this._pauseTime;
        this._pauseTime = 0;
      }

      this._resumeCallbacks.forEach(callback => callback());
    }
  }

  public setElapsedTime(elapsedTime: number): void {
    this._elapsedTime = elapsedTime;
  }

  public setIsGameOver(gameOver: boolean): void {
    this._isGameOver = gameOver;
    if (gameOver) {
      this._isPaused = false;
    }
  }

  public addPauseCallback(callback: () => void): void {
    this._pauseCallbacks.push(callback);
  }

  public addResumeCallback(callback: () => void): void {
    this._resumeCallbacks.push(callback);
  }

  public removePauseCallback(callback: () => void): void {
    const index = this._pauseCallbacks.indexOf(callback);
    if (index !== -1) {
      this._pauseCallbacks.splice(index, 1);
    }
  }

  public removeResumeCallback(callback: () => void): void {
    const index = this._resumeCallbacks.indexOf(callback);
    if (index !== -1) {
      this._resumeCallbacks.splice(index, 1);
    }
  }

  public reset(): void {
    this._isPaused = false;
    this._isGameOver = false;
    this._startTime = 0;
    this._pauseTime = 0;
    this._totalPauseTime = 0;
  }
}
