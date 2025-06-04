import Phaser from 'phaser';
import { Enemy, EnemyType, SpawnDirection } from './Enemy';

export class EnemyPool {
  private scene: Phaser.Scene;
  private pool: Enemy[] = [];
  private activeEnemies: Set<Enemy> = new Set();
  private enemyGroup: Phaser.GameObjects.Group;
  private readonly INITIAL_POOL_SIZE = 20;
  private readonly MAX_POOL_SIZE = 50;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.enemyGroup = scene.add.group();
    this.initializePool();
    this.setupEventListeners();
  }

  private initializePool(): void {
    for (let i = 0; i < this.INITIAL_POOL_SIZE; i++) {
      const enemy = new Enemy(this.scene, 0, 0);
      this.pool.push(enemy);
      this.enemyGroup.add(enemy);
    }
  }

  private setupEventListeners(): void {
    this.scene.events.on('enemy-return-to-pool', (enemy: Enemy) => {
      this.returnEnemy(enemy);
    });
  }

  public getEnemy(
    type: EnemyType,
    spawnDirection: SpawnDirection,
    x: number,
    y: number
  ): Enemy | null {
    let enemy: Enemy;

    if (this.pool.length > 0) {
      enemy = this.pool.pop()!;
    } else if (this.activeEnemies.size < this.MAX_POOL_SIZE) {
      enemy = new Enemy(this.scene, 0, 0);
      this.enemyGroup.add(enemy);
    } else {
      console.warn('Enemy pool exhausted - consider increasing MAX_POOL_SIZE');
      return null;
    }

    enemy.initialize(type, spawnDirection);
    enemy.setPosition(x, y);

    this.activeEnemies.add(enemy);
    return enemy;
  }

  public returnEnemy(enemy: Enemy): void {
    if (this.activeEnemies.has(enemy)) {
      this.activeEnemies.delete(enemy);

      enemy.reset();

      if (this.pool.length < this.INITIAL_POOL_SIZE) {
        this.pool.push(enemy);
      }
    }
  }

  public getActiveEnemies(): Enemy[] {
    return Array.from(this.activeEnemies).filter(enemy => enemy.getIsActive());
  }

  public getActiveEnemiesGroup(): Phaser.GameObjects.Group {
    return this.enemyGroup;
  }

  public getEnemyGroup(): Phaser.GameObjects.Group {
    return this.enemyGroup;
  }

  public getPoolStats(): { active: number; pooled: number; total: number } {
    return {
      active: this.activeEnemies.size,
      pooled: this.pool.length,
      total: this.activeEnemies.size + this.pool.length,
    };
  }

  public clearPool(): void {
    this.activeEnemies.forEach(enemy => {
      enemy.reset();
    });
    this.activeEnemies.clear();
  }

  public destroy(): void {
    this.scene.events.off('enemy-return-to-pool');
    this.clearPool();

    this.enemyGroup.destroy(true);
    this.pool = [];
  }
}
