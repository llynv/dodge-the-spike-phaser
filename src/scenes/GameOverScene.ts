import Phaser from 'phaser';
import { GameManager } from '../managers/GameManager';

export class GameOverScene extends Phaser.Scene {
  private readonly MENU_BUTTONS = {
    RESTART: {
      WIDTH: 150,
      HEIGHT: 60,
      TEXT: 'Restart',
      BACKGROUND_COLOR: '#3498db',
      HOVER_COLOR: '#2980b9',
      TEXT_COLOR: '#ffffff'
    },
    HIGH_SCORES: {
      WIDTH: 150,
      HEIGHT: 60,
      TEXT: 'High Scores',
      BACKGROUND_COLOR: '#e74c3c',
      HOVER_COLOR: '#c0392b',
      TEXT_COLOR: '#ffffff'
    }
  };

  private gameOverBackground!: Phaser.GameObjects.Rectangle;
  private gameOverContainer!: Phaser.GameObjects.Container;
  private scoreText!: Phaser.GameObjects.Text;
  private currentScore: number = 0;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { score: number }) {
    this.currentScore = data.score || 0;

    this.createGameOverOverlay();
    this.createGameOverUI();
    this.saveScore();

    this.scene.get('GameScene').scene.pause();
    GameManager.getInstance().setIsGameOver(true);
  }

  private createGameOverOverlay(): void {
    this.gameOverBackground = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.8
    );
    this.gameOverBackground.setDepth(1000);
  }

  private createGameOverUI(): void {
    this.gameOverContainer = this.add.container(this.scale.width / 2, this.scale.height / 2);

    const popup = this.add.rectangle(0, 0, 600, 400, 0x2c3e50);
    popup.setStrokeStyle(3, 0x34495e);

    const title = this.add.text(0, -100, 'GAME OVER', {
      fontSize: '32px',
      color: '#e74c3c',
      fontStyle: 'bold',
      stroke: 'rgba(0, 0, 0, 0.9)',
      strokeThickness: 4,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: 'rgba(0, 0, 0, 0.9)',
        blur: 4,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5);

    this.scoreText = this.add.text(0, -50, `Your Score: ${this.currentScore} points`, {
      fontSize: '24px',
      color: '#ecf0f1',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const restartBtn = this.createMenuButton(
      -75, 50,
      this.MENU_BUTTONS.RESTART.TEXT,
      this.MENU_BUTTONS.RESTART,
      () => this.restartGame()
    );

    const highScoreBtn = this.createMenuButton(
      75, 50,
      this.MENU_BUTTONS.HIGH_SCORES.TEXT,
      this.MENU_BUTTONS.HIGH_SCORES,
      () => this.goToHighScores()
    );

    this.gameOverContainer.add([popup, title, this.scoreText, restartBtn, highScoreBtn]);
    this.gameOverContainer.setDepth(1001);
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

  private saveScore(): void {
    const bestScore = parseInt(localStorage.getItem('bestScore') || '0');
    if (this.currentScore > bestScore) {
      localStorage.setItem('bestScore', this.currentScore.toString());

      const newHighScoreText = this.add.text(
        this.scale.width / 2,
        this.scale.height / 2 - 20,
        'NEW HIGH SCORE!',
        {
          fontSize: '20px',
          color: '#f1c40f',
          fontStyle: 'bold',
          stroke: 'rgba(0, 0, 0, 0.8)',
          strokeThickness: 2
        }
      ).setOrigin(0.5);
      newHighScoreText.setDepth(1002);

      this.tweens.add({
        targets: newHighScoreText,
        alpha: { from: 0.7, to: 1 },
        duration: 800,
        yoyo: true,
        repeat: -1
      });
    }
  }

  private restartGame(): void {
    GameManager.getInstance().reset();
    this.scene.stop();
    this.scene.start('GameScene');
  }

  private goToHighScores(): void {
    GameManager.getInstance().reset();
    this.scene.stop();
    this.scene.get('GameScene').scene.stop();
    this.scene.start('HighScoreScene');
  }
}
