import Phaser from 'phaser';
import { AudioService } from '../services/AudioService';

export class StartScene extends Phaser.Scene {
  private readonly TITLE = {
    WIDTH: 400,
    HEIGHT: 100,
    X_OFFSET: 200,
    Y_POSITION: 100,
    FONT_SIZE: 40,
    FONT_FAMILY: 'Arial',
    TEXT: 'DODGE THE SPIKE',
  };

  private readonly START_BUTTON = {
    WIDTH: 300,
    HEIGHT: 80,
    X_OFFSET: 150,
    Y_OFFSET: 0,
    TEXT: 'START GAME',
    NORMAL_COLOR: '#4CAF50',
    HOVER_COLOR: '#45a049',
    TEXT_COLOR: '#ffffff',
  };

  private readonly HIGH_SCORES_BUTTON = {
    WIDTH: 300,
    HEIGHT: 80,
    X_OFFSET: 150,
    Y_OFFSET: 100,
    TEXT: 'HIGH SCORES',
  };

  private readonly CREDITS = {
    WIDTH: 300,
    HEIGHT: 30,
    X_OFFSET: 150,
    Y_OFFSET: 40,
    FONT_SIZE: 14,
    FONT_FAMILY: 'Arial',
    TEXT: '© 2025 Dodge The Spike',
    BACKGROUND_ALPHA: 0.5,
  };

  private readonly COLORS = {
    FALLBACK_BACKGROUND: '#333333',
    WHITE: 'white',
    TRANSPARENT_BLACK: 'rgba(0, 0, 0, 0.5)',
  };

  constructor() {
    super({ key: 'StartScene' });
  }

  create() {
    this.createBackground();
    this.createTitle();
    this.createStartButton();
    this.createHighScoresButton();
    this.createCreditsText();

    AudioService.getInstance().playMenuMusic();
  }

  private createBackground(): void {
    let backgroundKey = 'background01';

    if (this.textures.exists('menu_background')) {
      backgroundKey = 'menu_background';
    }

    const background = this.add.image(0, 0, backgroundKey);
    background.setOrigin(0, 0);
    background.setDisplaySize(this.scale.width, this.scale.height);
  }

  private createTitle(): void {
    this.add
      .text(this.scale.width / 2, this.TITLE.Y_POSITION + this.TITLE.HEIGHT / 2, this.TITLE.TEXT, {
        fontSize: `${this.TITLE.FONT_SIZE}px`,
        color: this.COLORS.WHITE,
        fontFamily: this.TITLE.FONT_FAMILY,
        fontStyle: 'bold',
        stroke: 'rgba(0, 0, 0, 0.8)',
        strokeThickness: 3,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: 'rgba(0, 0, 0, 0.8)',
          blur: 4,
          stroke: true,
          fill: true,
        },
      })
      .setOrigin(0.5);
  }

  private createStartButton(): void {
    const button = this.add.container(
      this.scale.width / 2,
      this.scale.height / 2 + this.START_BUTTON.Y_OFFSET
    );

    const bg = this.add.rectangle(
      0,
      0,
      this.START_BUTTON.WIDTH,
      this.START_BUTTON.HEIGHT,
      Phaser.Display.Color.HexStringToColor(this.START_BUTTON.NORMAL_COLOR).color
    );

    const text = this.add
      .text(0, 0, this.START_BUTTON.TEXT, {
        fontSize: '24px',
        color: this.START_BUTTON.TEXT_COLOR,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    button.add([bg, text]);
    button.setSize(this.START_BUTTON.WIDTH, this.START_BUTTON.HEIGHT);
    button.setInteractive();

    button.on('pointerover', () => {
      bg.setFillStyle(Phaser.Display.Color.HexStringToColor(this.START_BUTTON.HOVER_COLOR).color);
      button.setScale(1.05);
      AudioService.getInstance().playButtonHover();
      AudioService.getInstance().playMenuMusic();
    });

    button.on('pointerout', () => {
      bg.setFillStyle(Phaser.Display.Color.HexStringToColor(this.START_BUTTON.NORMAL_COLOR).color);
      button.setScale(1.0);
    });

    button.on('pointerdown', () => {
      button.setScale(0.95);
    });

    button.on('pointerup', () => {
      button.setScale(1.05);
      AudioService.getInstance().playButtonClick();
      this.scene.start('GameScene');
    });
  }

  private createHighScoresButton(): void {
    const button = this.add.container(
      this.scale.width / 2,
      this.scale.height / 2 + this.HIGH_SCORES_BUTTON.Y_OFFSET
    );

    const bg = this.add.rectangle(
      0,
      0,
      this.HIGH_SCORES_BUTTON.WIDTH,
      this.HIGH_SCORES_BUTTON.HEIGHT,
      Phaser.Display.Color.HexStringToColor(this.START_BUTTON.NORMAL_COLOR).color
    );

    const text = this.add
      .text(0, 0, this.HIGH_SCORES_BUTTON.TEXT, {
        fontSize: '24px',
        color: this.START_BUTTON.TEXT_COLOR,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    button.add([bg, text]);
    button.setSize(this.HIGH_SCORES_BUTTON.WIDTH, this.HIGH_SCORES_BUTTON.HEIGHT);
    button.setInteractive();

    button.on('pointerover', () => {
      bg.setFillStyle(Phaser.Display.Color.HexStringToColor(this.START_BUTTON.HOVER_COLOR).color);
      button.setScale(1.05);
      AudioService.getInstance().playButtonHover();
      AudioService.getInstance().playMenuMusic();
    });

    button.on('pointerout', () => {
      bg.setFillStyle(Phaser.Display.Color.HexStringToColor(this.START_BUTTON.NORMAL_COLOR).color);
      button.setScale(1.0);
    });

    button.on('pointerdown', () => {
      button.setScale(0.95);
    });

    button.on('pointerup', () => {
      button.setScale(1.05);
      AudioService.getInstance().playButtonClick();
      this.scene.start('HighScoreScene');
    });
  }

  private createCreditsText(): void {
    const creditsY = this.scale.height - this.CREDITS.Y_OFFSET;

    this.add.rectangle(
      this.scale.width / 2,
      creditsY,
      this.CREDITS.WIDTH,
      this.CREDITS.HEIGHT,
      0x000000,
      this.CREDITS.BACKGROUND_ALPHA
    );

    this.add
      .text(this.scale.width / 2, creditsY, this.CREDITS.TEXT, {
        fontSize: `${this.CREDITS.FONT_SIZE}px`,
        color: this.COLORS.WHITE,
        fontFamily: this.CREDITS.FONT_FAMILY,
      })
      .setOrigin(0.5);
  }
}
