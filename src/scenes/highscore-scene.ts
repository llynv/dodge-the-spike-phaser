import Phaser from 'phaser';

export class HighScoreScene extends Phaser.Scene {
  // Configuration constants matching original
  private readonly TITLE = {
    Y_POSITION: 100,
    FONT_SIZE: 40,
    TEXT: 'HIGH SCORES'
  };

  private readonly BACK_BUTTON = {
    WIDTH: 200,
    HEIGHT: 60,
    TEXT: 'Back to Menu',
    BACKGROUND_COLOR: '#e74c3c',
    HOVER_COLOR: '#c0392b',
    TEXT_COLOR: '#ffffff'
  };

  private readonly COLORS = {
    FALLBACK_BACKGROUND: '#333333',
    WHITE: 'white',
    GOLD: '#ffd700',
    SILVER: '#c0c0c0',
    BRONZE: '#cd7f32'
  };

  constructor() {
    super({ key: 'HighScoreScene' });
  }

  create() {
    this.createBackground();
    this.createTitle();
    this.createScoreList();
    this.createBackButton();
  }

  private createBackground(): void {
    // Use background01 as fallback like original
    const background = this.add.image(0, 0, 'background01');
    background.setOrigin(0, 0);
    background.setDisplaySize(this.scale.width, this.scale.height);
  }

  private createTitle(): void {
    this.add.text(this.scale.width / 2, this.TITLE.Y_POSITION, this.TITLE.TEXT, {
      fontSize: `${this.TITLE.FONT_SIZE}px`,
      color: this.COLORS.WHITE,
      fontStyle: 'bold',
      stroke: 'rgba(0, 0, 0, 0.8)',
      strokeThickness: 3,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: 'rgba(0, 0, 0, 0.8)',
        blur: 4,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5);
  }

  private createScoreList(): void {
    // Get best score from localStorage (matching original)
    const bestScore = localStorage.getItem('bestScore') || '0';

    // Create score entries (simplified version of original high score system)
    const scores = [
      { score: parseInt(bestScore), name: 'You' },
      { score: 0, name: 'No Score' },
      { score: 0, name: 'No Score' },
      { score: 0, name: 'No Score' },
      { score: 0, name: 'No Score' }
    ];

    const startY = 250;
    const spacing = 80;

    scores.forEach((entry, index) => {
      const y = startY + (index * spacing);

      // Rank
      const rank = index + 1;
      const rankColor = this.getRankColor(rank);

      this.add.text(150, y, `${rank}.`, {
        fontSize: '24px',
        color: rankColor,
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);

      // Score
      this.add.text(this.scale.width / 2, y, `${entry.score} points`, {
        fontSize: '24px',
        color: this.COLORS.WHITE,
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);

      // Name/Label
      this.add.text(570, y, entry.name, {
        fontSize: '18px',
        color: '#cccccc'
      }).setOrigin(1, 0.5);
    });

    // Instructions
    this.add.text(this.scale.width / 2, 700, 'Play more games to improve your high score!', {
      fontSize: '18px',
      color: '#87CEEB',
      fontStyle: 'italic'
    }).setOrigin(0.5);
  }

  private getRankColor(rank: number): string {
    switch (rank) {
      case 1:
        return this.COLORS.GOLD;
      case 2:
        return this.COLORS.SILVER;
      case 3:
        return this.COLORS.BRONZE;
      default:
        return this.COLORS.WHITE;
    }
  }

  private createBackButton(): void {
    const button = this.add.container(
      this.scale.width / 2,
      this.scale.height - 150
    );

    const bg = this.add.rectangle(
      0, 0,
      this.BACK_BUTTON.WIDTH,
      this.BACK_BUTTON.HEIGHT,
      Phaser.Display.Color.HexStringToColor(this.BACK_BUTTON.BACKGROUND_COLOR).color
    );

    const text = this.add.text(0, 0, this.BACK_BUTTON.TEXT, {
      fontSize: '20px',
      color: this.BACK_BUTTON.TEXT_COLOR,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    button.add([bg, text]);
    button.setSize(this.BACK_BUTTON.WIDTH, this.BACK_BUTTON.HEIGHT);
    button.setInteractive();

    button.on('pointerover', () => {
      bg.setFillStyle(Phaser.Display.Color.HexStringToColor(this.BACK_BUTTON.HOVER_COLOR).color);
      button.setScale(1.05);
    });

    button.on('pointerout', () => {
      bg.setFillStyle(Phaser.Display.Color.HexStringToColor(this.BACK_BUTTON.BACKGROUND_COLOR).color);
      button.setScale(1.0);
    });

    button.on('pointerdown', () => {
      button.setScale(0.95);
    });

    button.on('pointerup', () => {
      button.setScale(1.05);
      this.scene.start('StartScene');
    });
  }
}
