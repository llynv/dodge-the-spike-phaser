import Phaser from 'phaser';
import { GameManager } from '../managers/GameManager';

export class OptionsScene extends Phaser.Scene {
  private readonly MENU_BUTTONS = {
    RESUME: {
      WIDTH: 200,
      HEIGHT: 60,
      TEXT: 'Resume Game',
      BACKGROUND_COLOR: '#34495e',
      HOVER_COLOR: '#2c3e50',
      TEXT_COLOR: '#ffffff'
    },
    RESTART: {
      WIDTH: 200,
      HEIGHT: 60,
      TEXT: 'Restart Game',
      BACKGROUND_COLOR: '#3498db',
      HOVER_COLOR: '#2980b9',
      TEXT_COLOR: '#ffffff'
    },
    BACK: {
      WIDTH: 200,
      HEIGHT: 60,
      TEXT: 'Back to Menu',
      BACKGROUND_COLOR: '#e74c3c',
      HOVER_COLOR: '#c0392b',
      TEXT_COLOR: '#ffffff'
    }
  };

  private optionsBackground!: Phaser.GameObjects.Rectangle;
  private optionsMenu!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'OptionsScene' });
  }

  create() {
    this.createOptionsOverlay();
    this.createOptionsMenu();

    GameManager.getInstance().setIsPaused(true);
    this.scene.get('GameScene').scene.pause();
  }

  private createOptionsOverlay(): void {
    this.optionsBackground = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.8
    );
    this.optionsBackground.setDepth(1000);
  }

  private createOptionsMenu(): void {
    this.optionsMenu = this.add.container(this.scale.width / 2, this.scale.height / 2);

    const title = this.add.text(0, -120, 'GAME PAUSED', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: 'rgba(0, 0, 0, 0.8)',
      strokeThickness: 3
    }).setOrigin(0.5);

    const resumeButton = this.createMenuButton(
      0, -30,
      this.MENU_BUTTONS.RESUME.TEXT,
      this.MENU_BUTTONS.RESUME,
      () => this.resumeGame()
    );

    const restartButton = this.createMenuButton(
      0, 40,
      this.MENU_BUTTONS.RESTART.TEXT,
      this.MENU_BUTTONS.RESTART,
      () => this.restartGame()
    );

    const backButton = this.createMenuButton(
      0, 110,
      this.MENU_BUTTONS.BACK.TEXT,
      this.MENU_BUTTONS.BACK,
      () => this.backToMenu()
    );

    this.optionsMenu.add([title, resumeButton, restartButton, backButton]);
    this.optionsMenu.setDepth(1001);
  }

  private createMenuButton(x: number, y: number, text: string, config: any, onClick: () => void): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);

    const bg = this.add.rectangle(
      0, 0,
      config.WIDTH,
      config.HEIGHT,
      Phaser.Display.Color.HexStringToColor(config.BACKGROUND_COLOR).color
    );

    const buttonText = this.add.text(0, 0, text, {
      fontSize: '18px',
      color: config.TEXT_COLOR,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    button.add([bg, buttonText]);
    button.setSize(config.WIDTH, config.HEIGHT);
    button.setInteractive();

    button.on('pointerover', () => {
      bg.setFillStyle(Phaser.Display.Color.HexStringToColor(config.HOVER_COLOR).color);
      button.setScale(1.05);
    });

    button.on('pointerout', () => {
      bg.setFillStyle(Phaser.Display.Color.HexStringToColor(config.BACKGROUND_COLOR).color);
      button.setScale(1.0);
    });

    button.on('pointerdown', () => {
      button.setScale(0.95);
    });

    button.on('pointerup', () => {
      button.setScale(1.05);
      onClick();
    });

    return button;
  }

  private resumeGame(): void {
    GameManager.getInstance().setIsPaused(false);
    this.scene.get('GameScene').scene.resume();
    this.scene.stop();
  }

  private restartGame(): void {
    GameManager.getInstance().reset();
    this.scene.stop();
    this.scene.start('GameScene');
  }

  private backToMenu(): void {
    GameManager.getInstance().reset();
    this.scene.stop();
    this.scene.get('GameScene').scene.stop();
    this.scene.start('StartScene');
  }
}
