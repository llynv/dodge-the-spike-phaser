import Phaser from 'phaser';
import { GameManager } from '../managers/GameManager';
import { Vec2 } from '../utils/math/vec2';

export enum SpawnDirection {
  LEFT = 'left',
  RIGHT = 'right',
  TOP = 'top',
}

export enum EnemyType {
  BASIC = 'basic',
  FAST = 'fast',
  TANK = 'tank',
}

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private readonly CONFIG = {
    BASIC: {
      SCALE: 1.5,
      SPEED: 150,
      DAMAGE: 25,
      COLOR: 0xff4444,
      HEALTH: 1,
    },
    FAST: {
      SCALE: 1.0,
      SPEED: 300,
      DAMAGE: 15,
      COLOR: 0xff8844,
      HEALTH: 1,
    },
    TANK: {
      SCALE: 2.0,
      SPEED: 75,
      DAMAGE: 50,
      COLOR: 0x884444,
      HEALTH: 2,
    },
  };

  private enemyType: EnemyType = EnemyType.BASIC;
  private spawnDirection: SpawnDirection = SpawnDirection.LEFT;
  private moveSpeed: number = 0;
  private damageValue: number = 0;
  private targetX: number = 0;
  private targetY: number = 0;
  private baseDirection: Vec2 = Vec2.Zero;
  private isActive: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type?: EnemyType,
    spawnDirection?: SpawnDirection
  ) {
    super(scene, x, y, 'enemy');

    this.play('enemy_fire');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setGravityY(0);
    body.setCollideWorldBounds(false);
    body.setBounce(0, 0);

    if (type && spawnDirection) {
      this.initialize(type, spawnDirection);
    } else {
      this.reset();
    }
  }

  public initialize(type: EnemyType, spawnDirection: SpawnDirection): void {
    this.enemyType = type;
    this.spawnDirection = spawnDirection;
    this.isActive = true;

    this.setActive(true);
    this.setVisible(true);

    if (this.body) {
      this.body.enable = true;
    }

    this.setupEnemyConfig();

    this.body?.velocity.set(0, 0);
    this.baseDirection = Vec2.Zero;
    this.setRotation(0);
    this.setFlipY(false);
  }

  public reset(): void {
    this.isActive = false;

    this.setActive(false);
    this.setVisible(false);

    if (this.body) {
      this.body.enable = false;
      this.body.velocity.set(0, 0);
    }

    this.baseDirection = Vec2.Zero;
    this.targetX = 0;
    this.targetY = 0;

    this.setPosition(-1000, -1000);
    this.setRotation(0);
    this.setFlipY(false);
  }

  private setupEnemyConfig(): void {
    const config = this.CONFIG[this.enemyType.toUpperCase() as keyof typeof this.CONFIG];

    this.setScale(config.SCALE);

    if (this.body) {
      this.body.setSize(this.width / 2, this.height / 2);
      this.body.setOffset(this.width / 4, this.height / 4);
    }

    this.moveSpeed = config.SPEED;
    this.damageValue = config.DAMAGE;
  }

  private handleSpriteOrientation(): void {
    if (
      this.spawnDirection === SpawnDirection.RIGHT ||
      (this.spawnDirection === SpawnDirection.TOP && this.x > this.targetX)
    ) {
      this.setFlipY(true);
    } else {
      this.setFlipY(false);
    }
  }

  public override update(time: number, delta: number): void {
    if (
      !this.isActive ||
      !this.visible ||
      GameManager.getInstance().getIsPaused() ||
      GameManager.getInstance().getIsGameOver()
    ) {
      return;
    }

    const direction = this.getDirection();
    this.body?.velocity.set(direction.x * this.moveSpeed, direction.y * this.moveSpeed);

    this.rotation = Math.atan2(this.body?.velocity.y ?? 0, this.body?.velocity.x ?? 0);

    this.checkBounds();
  }

  private checkBounds(): void {
    if (!this.isActive || !this.visible) return;

    const buffer = 200;
    const screenWidth = this.scene.cameras.main.width;
    const screenHeight = this.scene.cameras.main.height;

    if (
      this.x < -buffer ||
      this.x > screenWidth + buffer ||
      this.y < -buffer ||
      this.y > screenHeight + buffer
    ) {
      this.returnToPool();
    }
  }

  public returnToPool(): void {
    if (this.isActive) {
      this.reset();
      this.scene.events.emit('enemy-return-to-pool', this);
    }
  }

  public getType(): EnemyType {
    return this.enemyType;
  }

  public getDamage(): number {
    return this.damageValue;
  }

  public setTargetPosition(x: number, y: number): void {
    if (!this.isActive) return;

    this.targetX = x;
    this.targetY = y;

    this.handleSpriteOrientation();
  }

  public getIsActive(): boolean {
    return this.isActive && this.visible && this.active;
  }

  private getRandomOffsetY(): number {
    return Math.random() * 60 + 40;
  }

  private getDirection(): Vec2 {
    if (Vec2.equals(this.baseDirection, Vec2.Zero)) {
      this.baseDirection = Vec2.directionTo(
        new Vec2(this.x, this.y),
        new Vec2(this.targetX, this.targetY - this.getRandomOffsetY())
      );
    }
    return this.baseDirection;
  }

  public override destroy(fromScene?: boolean): void {
    if (this.isActive) {
      this.returnToPool();
    }
  }
}
