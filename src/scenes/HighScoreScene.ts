import Phaser from 'phaser';
import { HighScoreService } from '../services/HighScoreService';
import { ServiceContainer, ServiceKeys } from '../services/ServiceContainer';

export class HighScoreScene extends Phaser.Scene {

  private highScoreService: HighScoreService;

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
    WHITE: '#ffffff',
    BLACK: '#000000',
    GOLD: '#B8860B',
    SILVER: '#696969',
    BRONZE: '#8B4513',
    HEADER: '#333333',
    TIME: '#1E3A8A',
    DATE: '#4B5563',
    INFO: '#6B7280'
  };

  constructor() {
    super({ key: 'HighScoreScene' });
    this.highScoreService = ServiceContainer.getInstance().resolve<HighScoreService>(ServiceKeys.HIGH_SCORE_SERVICE);
  }

  async create() {
    this.createBackground();
    this.createTitle();
    this.createScoreList();
    this.createBackButton();
  }

  private createBackground(): void {
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

  private async createScoreList(): Promise<void> {
    const allScores = await this.highScoreService.getHighScores();

    const screenWidth = this.scale.width;
    const screenHeight = this.scale.height;
    const isMobile = screenWidth < 600;

    const startY = isMobile ? 180 : 200;
    const spacing = isMobile ? 35 : 45;
    const fontSize = isMobile ? '14px' : '18px';
    const rankFontSize = isMobile ? '16px' : '20px';

    const backButtonY = screenHeight - 150;
    const maxY = backButtonY - 50;

    const availableHeight = maxY - startY;
    const maxScores = Math.floor(availableHeight / spacing);
    const scoresToShow = Math.min(allScores.length, maxScores);
    const displayScores = allScores.slice(0, scoresToShow);

    const rankX = isMobile ? 50 : 70;
    const scoreX = screenWidth * 0.3;
    const timeX = screenWidth * 0.6;
    const dateX = screenWidth - (isMobile ? 60 : 100);

    const headerY = startY - (isMobile ? 40 : 50);
    this.add.text(rankX, headerY, 'Rank', {
      fontSize: isMobile ? '12px' : '14px',
      color: this.COLORS.HEADER,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(scoreX, headerY, 'Score', {
      fontSize: isMobile ? '12px' : '14px',
      color: this.COLORS.HEADER,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(timeX, headerY, 'Time', {
      fontSize: isMobile ? '12px' : '14px',
      color: this.COLORS.HEADER,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(dateX, headerY, 'Date', {
      fontSize: isMobile ? '12px' : '14px',
      color: this.COLORS.HEADER,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const lineY = headerY + (isMobile ? 20 : 25);
    const line = this.add.graphics();
    line.lineStyle(2, 0x333333);
    line.moveTo(isMobile ? 20 : 30, lineY);
    line.lineTo(screenWidth - (isMobile ? 20 : 30), lineY);
    line.stroke();


    displayScores.forEach((entry, index) => {
      const y = startY + (index * spacing);
      const rank = index + 1;
      const rankColor = this.getRankColor(rank);

      this.add.text(rankX, y, `${rank}`, {
        fontSize: rankFontSize,
        color: rankColor,
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.add.text(scoreX, y, `${entry.score}`, {
        fontSize: fontSize,
        color: this.COLORS.BLACK,
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.add.text(timeX, y, entry.time, {
        fontSize: isMobile ? '12px' : fontSize,
        color: this.COLORS.TIME
      }).setOrigin(0.5);

      const dateText = isMobile ? entry.date.split(' ')[0] : entry.date;
      this.add.text(dateX, y, dateText, {
        fontSize: isMobile ? '12px' : fontSize,
        color: this.COLORS.DATE
      }).setOrigin(0.5);
    });

    if (displayScores.length === 0) {
      this.add.text(screenWidth / 2, startY + 100, 'No high scores yet!\nPlay the game to set your first record!', {
        fontSize: isMobile ? '18px' : '20px',
        color: this.COLORS.INFO,
        fontStyle: 'italic',
        align: 'center'
      }).setOrigin(0.5);
    }


    if (allScores.length > scoresToShow && scoresToShow > 0) {
      const infoY = startY + (scoresToShow * spacing);
      this.add.text(screenWidth / 2, infoY, `Showing top ${scoresToShow} of ${allScores.length} scores`, {
        fontSize: isMobile ? '12px' : '14px',
        color: this.COLORS.INFO,
        fontStyle: 'italic'
      }).setOrigin(0.5);
    }
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
        return this.COLORS.BLACK;
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
