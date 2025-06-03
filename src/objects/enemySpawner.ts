import Phaser from 'phaser';
import { Enemy, EnemyType, SpawnDirection } from './enemy';
import { GameManager } from '../managers/gameManager';
import { Player } from './player';
import { Vec2 } from '../utils/math/vec2';
import { MathUtils } from '../utils/math/mathUtils';

export class EnemySpawner {
  private scene: Phaser.Scene;
  private enemies: Phaser.GameObjects.Group;
  private player: Player | undefined;

  private readonly CONFIG = {
    INITIAL_SPAWN_RATE: 2000,
    MIN_SPAWN_RATE: 300,
    SPAWN_RATE_DECREASE: 50,
    DIFFICULTY_INCREASE_INTERVAL: 10000,
  };

  private spawnDirections: SpawnDirection[] = [SpawnDirection.LEFT, SpawnDirection.RIGHT, SpawnDirection.TOP];
  private enemyTypeWeights: Record<EnemyType, number> = {
    [EnemyType.BASIC]: 70,
    [EnemyType.FAST]: 20,
    [EnemyType.TANK]: 10
  };

  private currentSpawnRate: number;
  private lastSpawnTime: number = 0;
  private lastDifficultyIncrease: number = 0;
  private spawnTimer: number = 0;
  private enemySize: { width: number, height: number } = { width: 0, height: 0 };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.enemies = scene.add.group();
    this.currentSpawnRate = this.CONFIG.INITIAL_SPAWN_RATE;
  }

  public setPlayer(player: Player): void {
    this.player = player;
  }

  public update(time: number, delta: number): void {
    if (GameManager.getInstance().getIsPaused() || GameManager.getInstance().getIsGameOver()) {
      return;
    }
    this.updateEnemies(time, delta);

    this.spawnTimer += delta;

    if (this.spawnTimer >= this.currentSpawnRate) {
      this.spawnEnemy();

      this.spawnTimer = 0;

      this.currentSpawnRate = Math.max(this.CONFIG.MIN_SPAWN_RATE, this.currentSpawnRate - this.CONFIG.SPAWN_RATE_DECREASE);
    }
  }

  private updateEnemies(time: number, delta: number): void {
    this.enemies.children.entries.forEach(enemy => {
      if (enemy instanceof Enemy) {
        enemy.update(time, delta);
      }
    });
  }

  private spawnEnemy(): void {
    if (!this.player) {
      console.error('Enemy spawner has no target node set');
      return;
    }

    const spawnDirection = this.getRandomSpawnDirection();

    const enemyType = this.getRandomEnemyType();

    const enemy = new Enemy(this.scene, 0, 0, enemyType, spawnDirection);

    this.setEnemySpawnPosition(enemy, spawnDirection);

    enemy.setTargetPosition(this.player.x, this.player.y);

    this.enemies.add(enemy);
  }

  private setEnemySpawnPosition(enemy: Enemy, direction: SpawnDirection): void {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    switch (direction) {
      case SpawnDirection.LEFT:
        enemy.x = -this.enemySize.width;
        enemy.y = MathUtils.random(this.enemySize.height, screenHeight - this.enemySize.height);
        break;

      case SpawnDirection.RIGHT:
        enemy.x = screenWidth + this.enemySize.width;
        enemy.y = MathUtils.random(this.enemySize.height, screenHeight - this.enemySize.height);
        break;

      case SpawnDirection.TOP:
        enemy.x = MathUtils.random(this.enemySize.width, screenWidth - this.enemySize.width);
        enemy.y = -this.enemySize.height;
        break;
    }
  }

  private getRandomSpawnDirection(): SpawnDirection {
    const index = Math.floor(Math.random() * this.spawnDirections.length);
    return this.spawnDirections[index];
  }

  private getRandomEnemyType(): EnemyType {
    let totalWeight = 0;
    for (const type in this.enemyTypeWeights) {
      if (!this.enemyTypeWeights[type as EnemyType]) {
        continue;
      }
      totalWeight += this.enemyTypeWeights[type as EnemyType];
    }

    const random = Math.random() * totalWeight;

    let runningTotal = 0;
    for (const type in this.enemyTypeWeights) {
      if (!this.enemyTypeWeights[type as EnemyType]) {
        continue;
      }
      runningTotal += this.enemyTypeWeights[type as EnemyType];
      if (random <= runningTotal) {
        return type as EnemyType;
      }
    }

    return EnemyType.BASIC;
  }

  public setEnemySize(width: number, height: number): void {
    this.enemySize = { width, height };
  }

  public getEnemies(): Phaser.GameObjects.Group {
    return this.enemies;
  }
}
