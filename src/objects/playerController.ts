import Phaser from 'phaser';
import { GameManager } from '../managers/gameManager';

export class PlayerController {
  private readonly PHYSICS_CONFIG = {
    MASS: 3,
    MOVE_ACCELERATION: 40000,
    MAX_MOVE_SPEED: 300,
    JUMP_IMPULSE: 350
  };

  private sprite: Phaser.Physics.Arcade.Sprite;
  private moveDir: number = 0;
  private isReversed: boolean = false;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private wasdKeys!: {
    up: Phaser.Input.Keyboard.Key,
    left: Phaser.Input.Keyboard.Key,
    down: Phaser.Input.Keyboard.Key,
    right: Phaser.Input.Keyboard.Key
  };

  constructor(sprite: Phaser.Physics.Arcade.Sprite, scene: Phaser.Scene) {
    this.sprite = sprite;
    this.setupPhysics();
    this.setupInput(scene);
  }

  private setupPhysics(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setMass(this.PHYSICS_CONFIG.MASS);
  }

  private setupInput(scene: Phaser.Scene): void {
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.spaceKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.wasdKeys = scene.input.keyboard!.addKeys('W,S,A,D') as any;
  }

  public update(deltaTime: number): void {
    if (GameManager.getInstance().getIsPaused() || GameManager.getInstance().getIsGameOver()) {
      return;
    }

    this.handleMovement(deltaTime);
    this.handleJump();
  }

  private handleMovement(deltaTime: number): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    this.moveDir = 0;

    if (this.cursors.left?.isDown || this.wasdKeys.left?.isDown) {
      this.moveDir = -1;
      this.isReversed = true;
    } else if (this.cursors.right?.isDown || this.wasdKeys.right?.isDown) {
      this.moveDir = 1;
      this.isReversed = false;
    }

    if (this.moveDir !== 0) {
      const acceleration = this.moveDir * this.PHYSICS_CONFIG.MOVE_ACCELERATION * deltaTime;
      body.setVelocityX(body.velocity.x + acceleration);

      const limitedSpeed = Math.min(
        Math.abs(body.velocity.x),
        this.PHYSICS_CONFIG.MAX_MOVE_SPEED
      );
      body.setVelocityX(limitedSpeed * Math.sign(body.velocity.x));
    } else {
      body.setVelocityX(body.velocity.x * 0.8);
    }
  }

  private handleJump(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;

    const jumpPressed = this.cursors.up?.isDown || this.wasdKeys.up?.isDown || this.spaceKey?.isDown;

    if (!jumpPressed) return;

    body.setVelocityY(-this.PHYSICS_CONFIG.JUMP_IMPULSE);
  }

  public getVelocity(): { x: number; y: number } {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    return { x: body.velocity.x, y: body.velocity.y };
  }

  public getIsJumping(): boolean {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    return !body.touching.down;
  }

  public getIsReversed(): boolean {
    return this.isReversed;
  }

  public getMoveDirection(): number {
    return this.moveDir;
  }
}
