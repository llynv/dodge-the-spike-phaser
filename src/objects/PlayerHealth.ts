import { GameManager } from '../managers/GameManager';
import { AudioService } from '../services/AudioService';

export class PlayerHealth {
  private readonly MAX_HEALTH = 100;
  private readonly INVULNERABILITY_DURATION = 2000;

  private health: number = this.MAX_HEALTH;
  private isInvulnerable: boolean = false;
  private invulnerabilityTimer: number = 0;

  private sprite: Phaser.Physics.Arcade.Sprite;

  constructor(sprite: Phaser.Physics.Arcade.Sprite) {
    this.sprite = sprite;
  }

  public update(deltaTime: number): void {
    this.updateInvulnerability(deltaTime);
  }

  private updateInvulnerability(deltaTime: number): void {
    if (!this.isInvulnerable) return;

    this.invulnerabilityTimer -= deltaTime * 1000;

    const flashSpeed = 100;
    const visible = Math.floor(this.invulnerabilityTimer / flashSpeed) % 2 === 0;
    this.sprite.setVisible(visible);

    if (this.invulnerabilityTimer > 0) return;

    this.isInvulnerable = false;
    this.sprite.setVisible(true);
  }

  public takeDamage(damage: number): boolean {
    if (this.isInvulnerable || GameManager.getInstance().getIsGameOver()) return false;

    this.health -= damage;

    if (this.health <= 0) {
      this.health = 0;
      this.die();
      return true;
    }

    AudioService.getInstance().playPlayerHurt();

    this.invulnerabilityTimer = !this.isInvulnerable ? this.INVULNERABILITY_DURATION : 0;
    this.isInvulnerable = true;

    return false;
  }

  private die(): void {
    AudioService.getInstance().playPlayerDie();
    GameManager.getInstance().setIsGameOver(true);
  }

  public getHealth(): number {
    return this.health;
  }

  public getMaxHealth(): number {
    return this.MAX_HEALTH;
  }

  public getIsInvulnerable(): boolean {
    return this.isInvulnerable;
  }

  public reset(): void {
    this.health = this.MAX_HEALTH;
    this.isInvulnerable = false;
    this.invulnerabilityTimer = 0;
    this.sprite.setVisible(true);
  }
}
