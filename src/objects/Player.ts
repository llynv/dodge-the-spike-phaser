import Phaser from 'phaser';
import { PlayerHealth } from './PlayerHealth';
import { PlayerStateManager, PlayerState } from './PlayerStateManager';
import { PlayerController } from './PlayerController';

export { PlayerState } from './PlayerStateManager';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly PLAYER_CONFIG = {
    SCALE: 0.5,
    COLLIDER: {
      WIDTH: 50,
      HEIGHT: 190,
      OFFSET: { x: 60, y: 60 },
    },
  };

  private health: PlayerHealth;
  private stateManager: PlayerStateManager;
  private controller: PlayerController;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_idle_fallback');

    this.setScale(this.PLAYER_CONFIG.SCALE);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(this.PLAYER_CONFIG.COLLIDER.WIDTH, this.PLAYER_CONFIG.COLLIDER.HEIGHT);
    body.setOffset(this.PLAYER_CONFIG.COLLIDER.OFFSET.x, this.PLAYER_CONFIG.COLLIDER.OFFSET.y);

    this.health = new PlayerHealth(this);
    this.stateManager = new PlayerStateManager(this);
    this.controller = new PlayerController(this, scene);

    this.stateManager.update(false);
  }

  public override update(time: number, delta: number): void {
    const deltaTime = delta / 1000;

    this.controller.update(deltaTime);
    this.health.update(deltaTime);
    this.stateManager.update(this.controller.getIsReversed());

    this.handleOutOfBounds();
  }

  private handleOutOfBounds(): void {
    if (
      this.x < -this.width ||
      this.x > this.scene.cameras.main.width + this.width ||
      this.y < -this.height ||
      this.y > this.scene.cameras.main.height + this.height
    ) {
      this.health.takeDamage(50);
      this.setPosition(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2);
    }
  }

  public takeDamage(damage: number): boolean {
    return this.health.takeDamage(damage);
  }

  public getHealth(): number {
    return this.health.getHealth();
  }

  public getMaxHealth(): number {
    return this.health.getMaxHealth();
  }

  public getCurrentState(): PlayerState {
    return this.stateManager.getCurrentState();
  }

  public getVelocity(): { x: number; y: number } {
    return this.controller.getVelocity();
  }

  public getIsJumping(): boolean {
    return this.controller.getIsJumping();
  }

  public getIsReversed(): boolean {
    return this.controller.getIsReversed();
  }

  public reset(): void {
    this.health.reset();
  }

  public getController(): PlayerController {
    return this.controller;
  }
}
