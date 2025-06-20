import Phaser from 'phaser';
import { Enemy, EnemyType, SpawnDirection } from './Enemy';
import { GameManager } from '../managers/GameManager';
import { Player } from './Player';
import { MathUtils } from '../utils/math/mathUtils';
import { EnemyPool } from './EnemyPool';

export class EnemySpawner {
  private scene: Phaser.Scene;
  private enemyPool: EnemyPool;
  private player: Player | undefined;
  private platforms: Phaser.Physics.Arcade.StaticGroup | undefined;
  private platformHeight: number = 0;
  private screenWidth: number = 0;
  private screenHeight: number = 0;

  private readonly CONFIG = {
    INITIAL_SPAWN_RATE: 2000,
    MIN_SPAWN_RATE: 300,
    SPAWN_RATE_DECREASE: 50,
    DIFFICULTY_INCREASE_INTERVAL: 10000,
  };

  private spawnDirections: SpawnDirection[] = [
    SpawnDirection.LEFT,
    SpawnDirection.RIGHT,
    SpawnDirection.TOP,
  ];
  private enemyTypeWeights: Record<EnemyType, number> = {
    [EnemyType.BASIC]: 70,
    [EnemyType.FAST]: 20,
    [EnemyType.TANK]: 10,
  };

  private currentSpawnRate: number;
  private spawnTimer: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.enemyPool = new EnemyPool(scene);
    this.currentSpawnRate = this.CONFIG.INITIAL_SPAWN_RATE;

    this.screenWidth = this.scene.cameras.main.width;
    this.screenHeight = this.scene.cameras.main.height;
  }

  public setPlayer(player: Player): void {
    this.player = player;
  }

  public setPlatforms(platforms: Phaser.Physics.Arcade.StaticGroup): void {
    this.platforms = platforms;
    this.platformHeight = this.platforms.getChildren().reduce((max, platform) => {
      return Math.max(max, (platform.body as Phaser.Physics.Arcade.Body).height);
    }, 0);
  }

  public update(time: number, delta: number): void {
    if (GameManager.getInstance().getIsPaused() || GameManager.getInstance().getIsGameOver())
      return;

    this.updateEnemies(time, delta);

    this.spawnTimer += delta;

    if (this.spawnTimer < this.currentSpawnRate) return;

    this.spawnEnemy();

    this.spawnTimer = 0;

    this.currentSpawnRate = Math.max(
      this.CONFIG.MIN_SPAWN_RATE,
      this.currentSpawnRate - this.CONFIG.SPAWN_RATE_DECREASE
    );
  }

  private updateEnemies(time: number, delta: number): void {
    const activeEnemies = this.enemyPool.getActiveEnemies();
    activeEnemies.forEach(enemy => enemy.update(time, delta));
  }

  private spawnEnemy(): void {
    if (!this.player) return;

    const spawnDirection = this.getRandomSpawnDirection();
    const enemyType = this.getRandomEnemyType();

    const spawnPos = this.getSpawnPosition(spawnDirection);

    const enemy = this.enemyPool.getEnemy(enemyType, spawnDirection, spawnPos.x, spawnPos.y);

    if (enemy) {
      enemy.setTargetPosition(this.player.x, this.player.y);
    }
  }

  private getSpawnPosition(direction: SpawnDirection): { x: number; y: number } {
    const enemySize = 50;

    switch (direction) {
      case SpawnDirection.LEFT:
        return {
          x: -enemySize,
          y: MathUtils.random(enemySize, this.screenHeight - enemySize - this.platformHeight),
        };

      case SpawnDirection.RIGHT:
        return {
          x: this.screenWidth + enemySize,
          y: MathUtils.random(enemySize, this.screenHeight - enemySize - this.platformHeight),
        };

      case SpawnDirection.TOP:
        return {
          x: MathUtils.random(enemySize, this.screenWidth - enemySize - this.platformHeight),
          y: -enemySize,
        };

      default:
        return { x: 0, y: 0 };
    }
  }

  private getRandomSpawnDirection(): SpawnDirection {
    const index = Math.floor(Math.random() * this.spawnDirections.length);
    return this.spawnDirections[index];
  }

  private getRandomEnemyType(): EnemyType {
    let totalWeight = 0;
    for (const type in this.enemyTypeWeights) {
      if (!this.enemyTypeWeights[type as EnemyType]) continue;

      totalWeight += this.enemyTypeWeights[type as EnemyType];
    }

    const random = Math.random() * totalWeight;

    let runningTotal = 0;
    for (const type in this.enemyTypeWeights) {
      if (!this.enemyTypeWeights[type as EnemyType]) continue;

      runningTotal += this.enemyTypeWeights[type as EnemyType];
      if (random <= runningTotal) {
        return type as EnemyType;
      }
    }

    return EnemyType.BASIC;
  }

  public getEnemies(): Phaser.GameObjects.Group {
    return this.enemyPool.getEnemyGroup();
  }

  public getActiveEnemies(): Enemy[] {
    return this.enemyPool.getActiveEnemies();
  }

  public getPoolStats(): { active: number; pooled: number; total: number } {
    return this.enemyPool.getPoolStats();
  }

  public clearEnemies(): void {
    this.enemyPool.clearPool();
  }

  public destroy(): void {
    this.enemyPool.destroy();
  }
}
