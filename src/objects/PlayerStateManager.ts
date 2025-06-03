import Phaser from 'phaser';

export enum PlayerState {
  IDLE = 'idle',
  RUNNING = 'running',
  JUMPING = 'jumping',
  FALLING = 'falling'
}

export class PlayerStateManager {
  private currentState: PlayerState = PlayerState.IDLE;
  private sprite: Phaser.Physics.Arcade.Sprite;

  constructor(sprite: Phaser.Physics.Arcade.Sprite) {
    this.sprite = sprite;
  }

  public update(isReversed: boolean): void {
    this.updateState();
    this.updateAnimations(isReversed);
  }

  private updateState(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
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

  private updateAnimations(isReversed: boolean): void {
    this.sprite.setFlipX(isReversed);

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
    if (this.sprite.scene.anims.exists(animKey)) {
      if (this.sprite.anims.currentAnim?.key !== animKey) {
        this.sprite.play(animKey);
      }
    } else {
      if (this.sprite.scene.anims.exists('player_idle') && this.sprite.anims.currentAnim?.key !== 'player_idle') {
        this.sprite.play('player_idle');
      }
    }
  }

  public getCurrentState(): PlayerState {
    return this.currentState;
  }

  public getIsJumping(): boolean {
    return this.currentState === PlayerState.JUMPING || this.currentState === PlayerState.FALLING;
  }
}
