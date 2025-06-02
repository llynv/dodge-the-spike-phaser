import Phaser from 'phaser';
import { GameManager } from '../managers/game-manager';
import { Vec2 } from '../utils/math/vec2';

export enum SpawnDirection {
  LEFT = 'left',
  RIGHT = 'right',
  TOP = 'top'
}

export enum EnemyType {
  BASIC = 'basic',
  FAST = 'fast',
  TANK = 'tank'
}

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private readonly CONFIG = {
    BASIC: {
      SCALE: 1.5,
      SPEED: 150,
      DAMAGE: 25,
      COLOR: 0xff4444,
      HEALTH: 1
    },
    FAST: {
      SCALE: 1.0,
      SPEED: 300,
      DAMAGE: 15,
      COLOR: 0xff8844,
      HEALTH: 1
    },
    TANK: {
      SCALE: 2.0,
      SPEED: 75,
      DAMAGE: 50,
      COLOR: 0x884444,
      HEALTH: 2
    }
  };

  private enemyType: EnemyType;
  private moveSpeed: number = 0;
  private damageValue: number = 0;
  private targetX: number = 0;
  private targetY: number = 0;
  private baseDirection: Vec2 = Vec2.Zero;

  constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType, spawnDirection: SpawnDirection) {
    super(scene, x, y, 'enemy');

    this.enemyType = type;
    this.setupEnemyConfig();

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(16);

    body.setGravityY(0);
    body.setCollideWorldBounds(false);
    body.setBounce(0, 0);
  }

  private setupEnemyConfig(): void {
    const config = this.CONFIG[this.enemyType.toUpperCase() as keyof typeof this.CONFIG];

    this.setScale(config.SCALE);
    this.setTint(config.COLOR);
    this.moveSpeed = config.SPEED;
    this.damageValue = config.DAMAGE;
  }

  public override update(time: number, delta: number): void {
    if (GameManager.instance.isPaused || GameManager.instance.isGameOver) {
      return;
    }
    const direction = this.getDirection();
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(direction.x * this.moveSpeed, direction.y * this.moveSpeed);

    this.checkBounds();
  }

  private checkBounds(): void {
    const buffer = 200;
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;

    if (this.x < -buffer || this.x > screenWidth + buffer ||
      this.y < -buffer || this.y > screenHeight + buffer) {
      this.destroy();
    }
  }

  public getType(): EnemyType {
    return this.enemyType;
  }

  public getDamage(): number {
    return this.damageValue;
  }

  public setTargetPosition(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
  }

  private getDirection(): Vec2 {
    if (Vec2.equals(this.baseDirection, Vec2.Zero)) {
      this.baseDirection = Vec2.directionTo(new Vec2(this.x, this.y), new Vec2(this.targetX, this.targetY));
    }
    return this.baseDirection;
  }
}
