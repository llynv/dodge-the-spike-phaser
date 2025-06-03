import Phaser from 'phaser';
import { GameManager } from '../managers/gameManager';
import { Player } from '../objects/player';
import { EnemySpawner } from '../objects/enemySpawner';
import { Enemy } from '../objects/enemy';

export class GameScene extends Phaser.Scene {
  private readonly BACKGROUND_CHANGE_INTERVAL = 15000;

  private readonly ENEMY_SPAWNER = {
    SPAWN_INTERVAL: 2.5,
    MIN_SPAWN_INTERVAL: 0.5,
    SPAWN_RATE_INCREASE: 0.1,
    ENEMY_SIZE: {
      WIDTH: 50,
      HEIGHT: 50
    }
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

  private readonly MENU_BUTTONS = {
    BACK: {
      WIDTH: 200,
      HEIGHT: 60,
      TEXT: 'Back to Menu',
      BACKGROUND_COLOR: '#e74c3c',
      HOVER_COLOR: '#c0392b',
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
    RESUME: {
      WIDTH: 200,
      HEIGHT: 60,
      TEXT: 'Resume Game',
      BACKGROUND_COLOR: '#34495e',
      HOVER_COLOR: '#2c3e50',
      TEXT_COLOR: '#ffffff'
    }
  };

  private player!: Player;
  private enemySpawner!: EnemySpawner;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;

  private timerText!: Phaser.GameObjects.Text;
  private optionsButton!: Phaser.GameObjects.Container;
  private pauseMenu!: Phaser.GameObjects.Container;
  private pauseBackground!: Phaser.GameObjects.Rectangle;
  private gameOverUI!: Phaser.GameObjects.Container;

  private background!: Phaser.GameObjects.Image;
  private backgroundIndex: number = 2;
  private backgroundInterval!: Phaser.Time.TimerEvent;

  private timeElapsed: number = 0;
  private isPaused: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    GameManager.getInstance().reset();

    this.createBackground();

    this.createGround();

    this.createPlayer();

    this.createEnemySpawner();

    this.createTimer();
    this.createOptionsButton();
    this.createPauseMenu();
    this.createGameOverUI();

    this.setupCollisions();

    this.setupPauseCallbacks();

    this.game.events.on('blur', () => {
      if (!GameManager.getInstance().getIsGameOver()) {
        GameManager.getInstance().pause();
      }
    });
  }

  override update(time: number, delta: number) {
    this.updateTimer(time, delta);

    this.player.update(time, delta);

    this.enemySpawner.update(time, delta);

    if (GameManager.getInstance().getIsGameOver() && !this.gameOverUI.visible) {
      this.showGameOver();
    }
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
    this.enemySpawner.setEnemySize(this.ENEMY_SPAWNER.ENEMY_SIZE.WIDTH, this.ENEMY_SPAWNER.ENEMY_SIZE.HEIGHT);
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
        GameManager.getInstance().setIsPaused(true);
      }
    });
  }

  private createPauseMenu(): void {
    this.pauseBackground = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.8
    );
    this.pauseBackground.setVisible(false);

    this.pauseMenu = this.add.container(this.scale.width / 2, this.scale.height / 2);

    const resumeButton = this.createMenuButton(
      0, -this.MENU_BUTTONS.RESUME.HEIGHT - 90,
      this.MENU_BUTTONS.RESUME.TEXT,
      this.MENU_BUTTONS.RESUME,
      () => GameManager.getInstance().setIsPaused(false)
    );

    const restartButton = this.createMenuButton(
      0, this.MENU_BUTTONS.RESTART.HEIGHT / 2,
      this.MENU_BUTTONS.RESTART.TEXT,
      this.MENU_BUTTONS.RESTART,
      () => this.scene.start('GameScene')
    );

    const backButton = this.createMenuButton(
      0, -this.MENU_BUTTONS.BACK.HEIGHT,
      this.MENU_BUTTONS.BACK.TEXT,
      this.MENU_BUTTONS.BACK,
      () => this.scene.start('StartScene')
    );

    this.pauseMenu.add([resumeButton, restartButton, backButton]);
    this.pauseMenu.setVisible(false);
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
    });

    button.on('pointerout', () => {
      bg.setFillStyle(Phaser.Display.Color.HexStringToColor(config.BACKGROUND_COLOR).color);
    });

    button.on('pointerdown', onClick);

    return button;
  }

  private createGameOverUI(): void {
    this.gameOverUI = this.add.container(this.scale.width / 2, this.scale.height / 2);

    const bg = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.8);

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

    const scoreText = this.add.text(0, -50, '', {
      fontSize: '24px',
      color: '#ecf0f1',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const restartBtn = this.createMenuButton(
      -75, 50,
      'Restart',
      { WIDTH: 150, HEIGHT: 60, BACKGROUND_COLOR: '#3498db', HOVER_COLOR: '#2980b9', TEXT_COLOR: '#ffffff' },
      () => {
        GameManager.getInstance().reset();
        this.scene.start('GameScene');
      }
    );

    const highScoreBtn = this.createMenuButton(
      75, 50,
      'High Scores',
      { WIDTH: 150, HEIGHT: 60, BACKGROUND_COLOR: '#e74c3c', HOVER_COLOR: '#c0392b', TEXT_COLOR: '#ffffff' },
      () => {
        this.scene.start('HighScoreScene');
      }
    );

    this.gameOverUI.add([bg, popup, title, scoreText, restartBtn, highScoreBtn]);
    this.gameOverUI.setVisible(false);

    (this.gameOverUI as any).scoreText = scoreText;
  }

  private showGameOver(): void {
    const scoreText = (this.gameOverUI as any).scoreText;
    scoreText.setText(`Your Score: ${Math.floor(this.timeElapsed)} points`);

    const currentScore = Math.floor(this.timeElapsed);
    const bestScore = parseInt(localStorage.getItem('bestScore') || '0');
    if (currentScore > bestScore) {
      localStorage.setItem('bestScore', currentScore.toString());
    }

    this.gameOverUI.setVisible(true);
  }

  private setupCollisions(): void {
    this.physics.add.collider(this.player, this.platforms);

    this.physics.add.overlap(this.player, this.enemySpawner.getEnemies(), (player, enemy) => {
      const playerSprite = player as Player;
      const enemySprite = enemy as Enemy;

      const died = playerSprite.takeDamage(enemySprite.getDamage());
      if (!died) {
        enemySprite.destroy();
      }
    });
  }

  private setupPauseCallbacks(): void {
    GameManager.getInstance().addPauseCallback(() => {
      this.pauseBackground.setVisible(true);
      this.pauseMenu.setVisible(true);
      this.physics.pause();
      this.backgroundInterval.paused = true;
    });

    GameManager.getInstance().addResumeCallback(() => {
      this.pauseBackground.setVisible(false);
      this.pauseMenu.setVisible(false);
      this.physics.resume();
      this.backgroundInterval.paused = false;
    });
  }

  shutdown() {
    this.backgroundInterval.destroy();
  }
}
