import Phaser from 'phaser';
import { GameManager } from '../managers/game-manager';

export enum PlayerState {
  IDLE = 'idle',
  RUNNING = 'running',
  JUMPING = 'jumping',
  FALLING = 'falling'
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly PLAYER_CONFIG = {
    SCALE: 0.5,
    PHYSICS: {
      MASS: 3,
      MOVE_ACCELERATION: 40000,
      MAX_MOVE_SPEED: 300,
      JUMP_IMPULSE: 350
    },
    COLLIDER: {
      OFFSET: { x: 0, y: 30 }
    },
    ANIMATION_FPS: 2,
    HEALTH: {
      MAX: 100,
      INVULNERABILITY_DURATION: 2000
    }
  };

  private currentState: PlayerState = PlayerState.IDLE;
  private isReversed: boolean = false;
  private moveDir: number = 0;

  private health: number = this.PLAYER_CONFIG.HEALTH.MAX;
  private isInvulnerable: boolean = false;
  private invulnerabilityTimer: number = 0;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private wasdKeys!: { up: Phaser.Input.Keyboard.Key, left: Phaser.Input.Keyboard.Key, down: Phaser.Input.Keyboard.Key, right: Phaser.Input.Keyboard.Key };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_idle');

    this.setScale(this.PLAYER_CONFIG.SCALE);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(
      this.width,
      this.height - this.PLAYER_CONFIG.COLLIDER.OFFSET.y
    );
    body.setOffset(
      this.PLAYER_CONFIG.COLLIDER.OFFSET.x,
      this.PLAYER_CONFIG.COLLIDER.OFFSET.y
    );
    body.setMass(this.PLAYER_CONFIG.PHYSICS.MASS);

    this.setupInput(scene);

    this.playAnimationSafe('player_idle');
  }

  private setupInput(scene: Phaser.Scene): void {
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.spaceKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.wasdKeys = scene.input.keyboard!.addKeys('W,S,A,D') as {
      up: Phaser.Input.Keyboard.Key,
      left: Phaser.Input.Keyboard.Key,
      down: Phaser.Input.Keyboard.Key,
      right: Phaser.Input.Keyboard.Key
    };
  }

  public override update(time: number, delta: number): void {
    if (GameManager.getInstance().getIsPaused() || GameManager.getInstance().getIsGameOver()) {
      return;
    }

    const deltaTime = delta / 1000;

    this.handleMovement(deltaTime);
    this.handleJump();
    this.updateState();
    this.updateHealth(deltaTime);
    this.updateAnimations();
  }

  private handleMovement(deltaTime: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    this.moveDir = 0;

    if (this.cursors.left?.isDown || this.wasdKeys.left?.isDown) {
      this.moveDir = -1;
      this.isReversed = true;
    } else if (this.cursors.right?.isDown || this.wasdKeys.right?.isDown) {
      this.moveDir = 1;
      this.isReversed = false;
    }

    if (this.moveDir !== 0) {
      const acceleration = this.moveDir * this.PLAYER_CONFIG.PHYSICS.MOVE_ACCELERATION * deltaTime;
      body.setVelocityX(body.velocity.x + acceleration);

      const limitedSpeed = Math.min(
        Math.abs(body.velocity.x),
        this.PLAYER_CONFIG.PHYSICS.MAX_MOVE_SPEED
      );
      body.setVelocityX(limitedSpeed * Math.sign(body.velocity.x));
    } else {
      body.setVelocityX(body.velocity.x * 0.8);
    }
  }

  private handleJump(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    const jumpPressed = this.cursors.up?.isDown || this.wasdKeys.up?.isDown || this.spaceKey?.isDown;

    if (jumpPressed) {
      body.setVelocityY(-this.PLAYER_CONFIG.PHYSICS.JUMP_IMPULSE);
    }
  }

  private updateState(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const velocity = { x: body.velocity.x, y: body.velocity.y };
    const isJumping = !body.touching.down;

    if (isJumping) {
      if (velocity.y < 0) {
        this.currentState = PlayerState.JUMPING;
      } else {
        this.currentState = PlayerState.FALLING;
      }
    } else {
      if (Math.abs(velocity.x) > 10) {
        this.currentState = PlayerState.RUNNING;
      } else {
        this.currentState = PlayerState.IDLE;
      }
    }
  }

  private updateAnimations(): void {
    this.setFlipX(this.isReversed);

    let animKey: string;
    switch (this.currentState) {
      case PlayerState.IDLE:
        animKey = 'player_idle';
        break;
      case PlayerState.RUNNING:
        animKey = 'player_run';
        break;
      case PlayerState.JUMPING:
        animKey = 'player_jump';
        break;
      case PlayerState.FALLING:
        animKey = 'player_jump';
        break;
      default:
        animKey = 'player_idle';
    }

    this.playAnimationSafe(animKey);
  }

  private playAnimationSafe(animKey: string): void {
    if (this.scene.anims.exists(animKey)) {
      if (this.anims.currentAnim?.key !== animKey) {
        this.play(animKey);
      }
    } else {
      if (this.scene.anims.exists('player_idle') && this.anims.currentAnim?.key !== 'player_idle') {
        this.play('player_idle');
      }
    }
  }

  private updateHealth(deltaTime: number): void {
    if (this.isInvulnerable) {
      this.invulnerabilityTimer -= deltaTime * 1000;

      const flashSpeed = 100;
      const visible = Math.floor(this.invulnerabilityTimer / flashSpeed) % 2 === 0;
      this.setVisible(visible);

      if (this.invulnerabilityTimer <= 0) {
        this.isInvulnerable = false;
        this.setVisible(true);
      }
    }
  }

  public takeDamage(damage: number): boolean {
    if (this.isInvulnerable || GameManager.getInstance().getIsGameOver()) {
      return false;
    }

    this.health -= damage;

    if (this.health <= 0) {
      this.health = 0;
      this.die();
      return true;
    }

    this.isInvulnerable = true;
    this.invulnerabilityTimer = this.PLAYER_CONFIG.HEALTH.INVULNERABILITY_DURATION;

    return false;
  }

  private die(): void {
    GameManager.getInstance().setIsGameOver(true);
  }

  public getVelocity(): { x: number; y: number } {
    const body = this.body as Phaser.Physics.Arcade.Body;
    return { x: body.velocity.x, y: body.velocity.y };
  }

  public getIsJumping(): boolean {
    const body = this.body as Phaser.Physics.Arcade.Body;
    return !body.touching.down;
  }

  public getIsReversed(): boolean {
    return this.isReversed;
  }

  public getHealth(): number {
    return this.health;
  }

  public getMaxHealth(): number {
    return this.PLAYER_CONFIG.HEALTH.MAX;
  }

  public getCurrentState(): PlayerState {
    return this.currentState;
  }
}
