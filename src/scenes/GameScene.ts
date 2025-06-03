import Phaser from 'phaser';
import { GameManager } from '../managers/GameManager';
import { Player } from '../objects/Player';
import { EnemySpawner } from '../objects/EnemySpawner';
import { Enemy } from '../objects/Enemy';
import { HighScoreService } from '../services/HighScoreService';
import { ServiceContainer, ServiceKeys } from '../services/ServiceContainer';

export class GameScene extends Phaser.Scene {
  private readonly BACKGROUND_CHANGE_INTERVAL = 15000;
  private highScoreService: HighScoreService;

  private readonly ENEMY_SPAWNER = {
    SPAWN_INTERVAL: 2.5,
    MIN_SPAWN_INTERVAL: 0.5,
    SPAWN_RATE_INCREASE: 0.1,
  };

  private readonly PLAYER = {
    POSITION: {
      X: 200,
      Y: 100
    }
  };

  private readonly OPTIONS_BUTTON = {
    POSITION: {
      X_OFFSET: 200,
      Y: 20
    },
    SIZE: {
      WIDTH: 100,
      HEIGHT: 40
    },
    TEXT: {
      OPTIONS: 'Options'
    },
    COLORS: {
      BACKGROUND: '#34495e',
      HOVER: '#2c3e50',
      TEXT: '#ecf0f1'
    }
  };

  private readonly HEALTH_BAR = {
    POSITION: {
      X: 20,
      Y: 80
    },
    SIZE: {
      WIDTH: 200,
      HEIGHT: 20
    },
    COLORS: {
      BACKGROUND: 0x000000,
      BORDER: 0x333333,
      FULL_HEALTH: 0x00ff00,
      MEDIUM_HEALTH: 0xffff00,
      LOW_HEALTH: 0xff0000
    },
    BORDER_WIDTH: 2
  };

  private player!: Player;
  private enemySpawner!: EnemySpawner;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;

  private timerText!: Phaser.GameObjects.Text;
  private optionsButton!: Phaser.GameObjects.Container;

  private healthBarContainer!: Phaser.GameObjects.Container;
  private healthBarBackground!: Phaser.GameObjects.Rectangle;
  private healthBarBorder!: Phaser.GameObjects.Rectangle;
  private healthBarFill!: Phaser.GameObjects.Rectangle;
  private healthText!: Phaser.GameObjects.Text;

  private performanceText!: Phaser.GameObjects.Text;
  private showPerformanceStats: boolean = false;

  private background!: Phaser.GameObjects.Image;
  private backgroundIndex: number = 2;
  private backgroundInterval!: Phaser.Time.TimerEvent;

  private timeElapsed: number = 0;
  private isPaused: boolean = false;
  private gameOverShown: boolean = false;

  constructor() {
    super({ key: 'GameScene' });

    this.highScoreService = ServiceContainer.getInstance().resolve<HighScoreService>(ServiceKeys.HIGH_SCORE_SERVICE);
  }

  create() {
    GameManager.getInstance().reset();
    this.scene.resume();
    this.timeElapsed = 0;
    this.gameOverShown = false;

    this.events.emit('restart');

    this.createBackground();

    this.createGround();

    this.createPlayer();

    this.createEnemySpawner();

    this.createTimer();
    this.createHealthBar();
    this.createOptionsButton();
    this.createPerformanceDisplay();

    this.setupCollisions();
    this.setupDebugControls();
  }

  override update(time: number, delta: number) {
    this.updateTimer(time, delta);

    this.player.update(time, delta);

    this.enemySpawner.update(time, delta);

    this.updateHealthBar();

    if (GameManager.getInstance().getIsGameOver() && !this.gameOverShown) {
      this.showGameOver();
    }

    this.updatePerformanceDisplay();
  }

  private updateTimer(time: number, delta: number): void {
    if (GameManager.getInstance().getIsPaused() || GameManager.getInstance().getIsGameOver()) {
      return;
    }
    this.timeElapsed += delta / 1000;
    this.updateTimerDisplay();
  }

  private createBackground(): void {
    this.background = this.add.image(0, 0, 'background01');
    this.background.setOrigin(0, 0);
    this.background.setDisplaySize(this.scale.width, this.scale.height);

    this.backgroundInterval = this.time.addEvent({
      delay: this.BACKGROUND_CHANGE_INTERVAL,
      callback: this.changeBackground,
      callbackScope: this,
      loop: true
    });
  }

  private changeBackground(): void {
    if (GameManager.getInstance().getIsGameOver() || GameManager.getInstance().getIsPaused()) return;

    const changeIndexState = (idx: number) => 3 - idx;

    const nextBgKey = `background0${this.backgroundIndex}`;
    this.backgroundIndex = changeIndexState(this.backgroundIndex);

    this.tweens.add({
      targets: this.background,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        if (this.textures.exists(nextBgKey)) {
          this.background.setTexture(nextBgKey);
        }
        this.tweens.add({
          targets: this.background,
          alpha: 1,
          duration: 800
        });
      }
    });
  }

  private createGround(): void {
    this.platforms = this.physics.add.staticGroup();
    const groundSprite = this.add.sprite(0, 0, 'ground');
    groundSprite.setDisplaySize(this.scale.width, 200);
    groundSprite.setPosition(this.scale.width / 2, this.scale.height - 50);
    groundSprite.setSize(this.scale.width, 200);
    this.physics.add.existing(groundSprite, true);
    this.platforms.add(groundSprite);
  }

  private createPlayer(): void {
    this.player = new Player(
      this,
      this.PLAYER.POSITION.X,
      this.PLAYER.POSITION.Y
    );
    this.player.setName('player');
  }

  private createEnemySpawner(): void {
    this.enemySpawner = new EnemySpawner(this);
    this.enemySpawner.setPlayer(this.player);
  }

  private createTimer(): void {
    this.timerText = this.add.text(
      this.scale.width / 2,
      30,
      'Points: 0',
      {
        fontSize: '24px',
        color: '#f1f2f3',
        fontFamily: 'monospace',
        fontStyle: 'bold',
        stroke: 'rgba(0, 0, 0, 0.8)',
        strokeThickness: 4,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: 'rgba(0, 0, 0, 0.8)',
          blur: 4,
          stroke: true,
          fill: true
        }
      }
    );
    this.timerText.setOrigin(0.5, 0);
  }

  private updateTimerDisplay(): void {
    this.timerText.setText(`Points: ${Math.floor(this.timeElapsed)}`);
  }

  private createHealthBar(): void {
    this.healthBarContainer = this.add.container(
      this.HEALTH_BAR.POSITION.X,
      this.HEALTH_BAR.POSITION.Y
    );

    this.healthBarBackground = this.add.rectangle(
      0, 0,
      this.HEALTH_BAR.SIZE.WIDTH,
      this.HEALTH_BAR.SIZE.HEIGHT,
      this.HEALTH_BAR.COLORS.BACKGROUND
    );
    this.healthBarBackground.setOrigin(0, 0.5);

    this.healthBarBorder = this.add.rectangle(
      0, 0,
      this.HEALTH_BAR.SIZE.WIDTH + this.HEALTH_BAR.BORDER_WIDTH,
      this.HEALTH_BAR.SIZE.HEIGHT + this.HEALTH_BAR.BORDER_WIDTH,
      this.HEALTH_BAR.COLORS.BORDER
    );
    this.healthBarBorder.setOrigin(0, 0.5);
    this.healthBarBorder.setStrokeStyle(this.HEALTH_BAR.BORDER_WIDTH, this.HEALTH_BAR.COLORS.BORDER);

    this.healthBarFill = this.add.rectangle(
      0, 0,
      this.HEALTH_BAR.SIZE.WIDTH,
      this.HEALTH_BAR.SIZE.HEIGHT,
      this.HEALTH_BAR.COLORS.FULL_HEALTH
    );
    this.healthBarFill.setOrigin(0, 0.5);

    this.healthText = this.add.text(
      this.HEALTH_BAR.SIZE.WIDTH / 2,
      0,
      '100/100',
      {
        fontSize: '14px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        stroke: 'rgba(0, 0, 0, 0.8)',
        strokeThickness: 2
      }
    );
    this.healthText.setOrigin(0.5, 0.5);

    this.healthBarContainer.add([
      this.healthBarBorder,
      this.healthBarBackground,
      this.healthBarFill,
      this.healthText
    ]);

    this.healthBarContainer.setDepth(1000);
  }

  private updateHealthBar(): void {
    if (!this.player || !this.healthBarFill || !this.healthText) {
      return;
    }

    const currentHealth = this.player.getHealth();
    const maxHealth = this.player.getMaxHealth();
    const healthPercentage = currentHealth / maxHealth;

    const fillWidth = this.HEALTH_BAR.SIZE.WIDTH * healthPercentage;
    this.healthBarFill.setDisplaySize(fillWidth, this.HEALTH_BAR.SIZE.HEIGHT);

    this.healthText.setText(`${Math.ceil(currentHealth)}/${maxHealth}`);

    let color = this.HEALTH_BAR.COLORS.FULL_HEALTH;
    if (healthPercentage <= 0.25) {
      color = this.HEALTH_BAR.COLORS.LOW_HEALTH;
    } else if (healthPercentage <= 0.5) {
      color = this.HEALTH_BAR.COLORS.MEDIUM_HEALTH;
    }
    this.healthBarFill.setFillStyle(color);
  }

  private createOptionsButton(): void {
    this.optionsButton = this.add.container(
      this.scale.width - this.OPTIONS_BUTTON.POSITION.X_OFFSET,
      this.OPTIONS_BUTTON.POSITION.Y
    );

    const bg = this.add.rectangle(
      0, 0,
      this.OPTIONS_BUTTON.SIZE.WIDTH,
      this.OPTIONS_BUTTON.SIZE.HEIGHT,
      Phaser.Display.Color.HexStringToColor(this.OPTIONS_BUTTON.COLORS.BACKGROUND).color
    );

    const text = this.add.text(0, 0, this.OPTIONS_BUTTON.TEXT.OPTIONS, {
      fontSize: '16px',
      color: this.OPTIONS_BUTTON.COLORS.TEXT
    }).setOrigin(0.5);

    this.optionsButton.add([bg, text]);
    this.optionsButton.setSize(this.OPTIONS_BUTTON.SIZE.WIDTH, this.OPTIONS_BUTTON.SIZE.HEIGHT);
    this.optionsButton.setInteractive();

    this.optionsButton.on('pointerover', () => {
      bg.setFillStyle(Phaser.Display.Color.HexStringToColor(this.OPTIONS_BUTTON.COLORS.HOVER).color);
    });

    this.optionsButton.on('pointerout', () => {
      bg.setFillStyle(Phaser.Display.Color.HexStringToColor(this.OPTIONS_BUTTON.COLORS.BACKGROUND).color);
    });

    this.optionsButton.on('pointerdown', () => {
      if (!GameManager.getInstance().getIsGameOver()) {
        this.scene.launch('OptionsScene');
      }
    });
  }

  private createPerformanceDisplay(): void {
    this.performanceText = this.add.text(
      10,
      this.scale.height - 80,
      '',
      {
        fontSize: '12px',
        color: '#00ff00',
        fontFamily: 'monospace',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: { left: 5, right: 5, top: 2, bottom: 2 }
      }
    );
    this.performanceText.setDepth(1001);
    this.performanceText.setVisible(this.showPerformanceStats);
  }

  private showGameOver(): void {
    const currentScore = Math.floor(this.timeElapsed);

    this.saveScore(currentScore);

    this.scene.stop();
    this.scene.launch('GameOverScene', { score: currentScore });
  }

  private saveScore(score: number): void {
    this.highScoreService.addScore(score, Date.now());
  }

  private setupCollisions(): void {
    this.physics.add.collider(this.player, this.platforms);

    this.physics.add.overlap(
      this.player,
      this.enemySpawner.getEnemies(),
      (player, enemy) => {
        const playerSprite = player as Player;
        const enemySprite = enemy as Enemy;

        if (!enemySprite.getIsActive() || !enemySprite.visible || !enemySprite.active) {
          return;
        }

        const died = playerSprite.takeDamage(enemySprite.getDamage());
        if (!died) {
          enemySprite.returnToPool();
        }
      }
    );
  }

  private setupDebugControls(): void {
    this.input.keyboard?.on('keydown-P', () => {
      this.showPerformanceStats = !this.showPerformanceStats;
      this.performanceText.setVisible(this.showPerformanceStats);
    });
  }

  private updatePerformanceDisplay(): void {
    if (!this.showPerformanceStats) return;

    const poolStats = this.enemySpawner.getPoolStats();
    const fps = this.game.loop.actualFps;

    const perfText = [
      `FPS: ${Math.round(fps)}`,
      `Enemies - Active: ${poolStats.active}`,
      `Enemies - Pooled: ${poolStats.pooled}`,
      `Enemies - Total: ${poolStats.total}`
    ].join('\n');

    this.performanceText.setText(perfText);
  }

  shutdown() {
    this.backgroundInterval.destroy();
    this.enemySpawner.destroy();

    if (this.performanceText) {
      this.performanceText.destroy();
    }
  }
}
