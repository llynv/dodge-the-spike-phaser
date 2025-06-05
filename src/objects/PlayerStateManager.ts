import Phaser from 'phaser';
import { StateMachine, StateHandler } from '../utils/StateMachine';
import { AudioService } from '../services/AudioService';

export enum PlayerState {
  IDLE = 'idle',
  RUNNING = 'running',
  JUMPING = 'jumping',
  FALLING = 'falling',
}

export class PlayerStateManager {
  private stateMachine: StateMachine<PlayerState>;
  private sprite: Phaser.Physics.Arcade.Sprite;

  constructor(sprite: Phaser.Physics.Arcade.Sprite) {
    this.sprite = sprite;

    const validTransitions = new Map<PlayerState, PlayerState[]>();
    validTransitions.set(PlayerState.IDLE, [
      PlayerState.RUNNING,
      PlayerState.JUMPING,
      PlayerState.FALLING,
    ]);
    validTransitions.set(PlayerState.RUNNING, [
      PlayerState.IDLE,
      PlayerState.JUMPING,
      PlayerState.FALLING,
    ]);
    validTransitions.set(PlayerState.JUMPING, [PlayerState.FALLING]);
    validTransitions.set(PlayerState.FALLING, [
      PlayerState.IDLE,
      PlayerState.RUNNING,
      PlayerState.JUMPING,
    ]);

    const stateHandlers = new Map<PlayerState, StateHandler<PlayerState>>();

    stateHandlers.set(PlayerState.IDLE, {
      onEnter: () => this.playAnimationSafe('player_idle'),
      onUpdate: () => this.updateIdleState(),
    });

    stateHandlers.set(PlayerState.RUNNING, {
      onEnter: () => this.playAnimationSafe('player_run'),
      onUpdate: () => this.updateRunningState(),
    });

    stateHandlers.set(PlayerState.JUMPING, {
      onEnter: () => {
        this.playAnimationSafe('player_jump');
        AudioService.getInstance().playPlayerJump();
      },
      onUpdate: () => this.updateJumpingState(),
    });

    stateHandlers.set(PlayerState.FALLING, {
      onEnter: () => this.playAnimationSafe('player_jump'),
      onUpdate: () => this.updateFallingState(),
      onExit: () => this.exitFallingState(),
    });

    this.stateMachine = new StateMachine({
      initialState: PlayerState.IDLE,
      validTransitions,
      stateHandlers,
      enableLogging: false,
    });
  }

  public update(isReversed: boolean, deltaTime: number = 0): void {
    this.sprite.setFlipX(isReversed);

    const newState = this.determineState();

    if (newState !== this.stateMachine.getCurrentState()) {
      this.stateMachine.transitionTo(newState);
    }

    this.stateMachine.update(deltaTime);
  }

  private determineState(): PlayerState {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const velocity = { x: body.velocity.x, y: body.velocity.y };
    const isOnGround = body.touching.down;

    if (!isOnGround) return velocity.y < 0 ? PlayerState.JUMPING : PlayerState.FALLING;

    return Math.abs(velocity.x) > 10 ? PlayerState.RUNNING : PlayerState.IDLE;
  }

  private updateIdleState(): void {}

  private updateRunningState(): void {}

  private updateJumpingState(): void {}

  private updateFallingState(): void {}

  private exitFallingState(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (!body.touching.down) return;

    AudioService.getInstance().playPlayerLand();
  }

  private playAnimationSafe(animKey: string): void {
    if (!this.sprite.scene.anims.exists(animKey)) {
      this.playDistinctAnimation('player_idle');
      return;
    }

    this.playDistinctAnimation(animKey);
  }

  private playDistinctAnimation(animKey: string): void {
    if (this.sprite.anims.currentAnim?.key === animKey) return;

    this.sprite.play(animKey);
  }

  public getCurrentState(): PlayerState {
    return this.stateMachine.getCurrentState();
  }

  public getPreviousState(): PlayerState | undefined {
    return this.stateMachine.getPreviousState();
  }

  public getIsJumping(): boolean {
    return (
      this.stateMachine.isInState(PlayerState.JUMPING) ||
      this.stateMachine.isInState(PlayerState.FALLING)
    );
  }

  public isInState(state: PlayerState): boolean {
    return this.stateMachine.isInState(state);
  }

  public wasInState(state: PlayerState): boolean {
    return this.stateMachine.wasInState(state);
  }

  public addStateChangeCallback(
    callback: (newState: PlayerState, oldState?: PlayerState | undefined) => void
  ): void {
    this.stateMachine.addStateChangeCallback(callback);
  }

  public removeStateChangeCallback(
    callback: (newState: PlayerState, oldState?: PlayerState | undefined) => void
  ): void {
    this.stateMachine.removeStateChangeCallback(callback);
  }

  public reset(): void {
    this.stateMachine.reset(PlayerState.IDLE);
  }
}
