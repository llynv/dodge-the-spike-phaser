import Phaser from 'phaser';

export class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }

  create() {
    this.createBackground();

    this.add.text(360, 300, 'DODGE THE SPIKE', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.add.text(360, 370, 'Endless Platformer', {
      fontSize: '24px',
      color: '#ffff00',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    const startButton = this.createButton(360, 500, 'START GAME', 0x4CAF50, 0x45a049);
    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    const highScoreButton = this.createButton(360, 600, 'HIGH SCORES', 0x2196F3, 0x1976D2);
    highScoreButton.on('pointerdown', () => {
      this.showHighScorePreview();
    });

    this.add.text(360, 750, 'Flap your wings to avoid enemies!\nStay alive as long as possible!', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    const bestScore = localStorage.getItem('bestScore') || '0';
    this.add.text(360, 850, `Your Best Score: ${bestScore}`, {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5);

    this.add.text(360, 1200, '© 2025 Dodge The Spike - Made with Phaser 3', {
      fontSize: '14px',
      color: '#cccccc'
    }).setOrigin(0.5);
  }

  private createBackground() {
    const background = this.add.image(0, 0, 'background01');
    background.setOrigin(0, 0);
    background.setDisplaySize(720, 1280);
  }

  private createButton(x: number, y: number, text: string, normalColor: number, hoverColor: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 300, 60, normalColor);
    bg.setStrokeStyle(3, 0xffffff);

    const buttonText = this.add.text(0, 0, text, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    container.add([bg, buttonText]);
    container.setSize(300, 60);
    container.setInteractive();

    container.on('pointerover', () => {
      bg.setFillStyle(hoverColor);
      container.setScale(1.05);
    });

    container.on('pointerout', () => {
      bg.setFillStyle(normalColor);
      container.setScale(1.0);
    });

    container.on('pointerdown', () => {
      container.setScale(0.95);
    });

    container.on('pointerup', () => {
      container.setScale(1.05);
    });

    return container;
  }

  private showHighScorePreview() {
    const overlay = this.add.rectangle(360, 640, 720, 1280, 0x000000, 0.8);

    const title = this.add.text(360, 400, 'HIGH SCORES', {
      fontSize: '48px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const closeText = this.add.text(360, 700, 'TAP ANYWHERE TO CLOSE', {
      fontSize: '24px',
      color: '#87CEEB'
    }).setOrigin(0.5);

    overlay.setInteractive();
    overlay.on('pointerdown', () => {
      overlay.destroy();
      title.destroy();
      closeText.destroy();
    });
  }
}
