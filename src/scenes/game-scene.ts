import Phaser from 'phaser';
import { GameManager } from '../managers/game-manager';
import { Player } from '../objects/player';
import { EnemySpawner } from '../objects/enemy-spawner';
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

  // Background system
  private background!: Phaser.GameObjects.Image;
  private backgroundIndex: number = 2;
  private backgroundInterval!: Phaser.Time.TimerEvent;

  // Game state
  private timeElapsed: number = 0;
  private isPaused: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Initialize game manager
    GameManager.instance.reset();

    // Create background
    this.createBackground();

    // Create ground/platforms
    this.createGround();

    // Create player
    this.createPlayer();

    // Create enemy spawner
    this.createEnemySpawner();

    // Create UI
    this.createTimer();
    this.createOptionsButton();
    this.createPauseMenu();
    this.createGameOverUI();

    // Set up physics collisions
    this.setupCollisions();

    // Set up pause/resume callbacks
    this.setupPauseCallbacks();

    // Handle window blur (matching original)
    this.game.events.on('blur', () => {
      if (!GameManager.instance.isGameOver) {
        GameManager.instance.pause();
      }
    });
  }

  override update(time: number, delta: number) {
    if (GameManager.instance.isPaused || GameManager.instance.isGameOver) {
      return;
    }

    // Update timer
    this.timeElapsed += delta / 1000;
    GameManager.instance.setElapsedTime(this.timeElapsed); // TODO: Remove this
    this.updateTimerDisplay();

    // Update player
    this.player.update(time, delta);

    // Update enemy spawner
    this.enemySpawner.update(time, delta);

    // Check for game over
    if (GameManager.instance.isGameOver && !this.gameOverUI.visible) {
      this.showGameOver();
    }
  }

  private createBackground(): void {
    this.background = this.add.image(0, 0, 'background01');
    this.background.setOrigin(0, 0);
    this.background.setDisplaySize(this.scale.width, this.scale.height);

    // Start background change timer (matching original logic)
    this.backgroundInterval = this.time.addEvent({
      delay: this.BACKGROUND_CHANGE_INTERVAL,
      callback: this.changeBackground,
      callbackScope: this,
      loop: true
    });
  }

  private changeBackground(): void {
    if (GameManager.instance.isGameOver || GameManager.instance.isPaused) return;

    const changeIndexState = (idx: number) => 3 - idx;

    // Get next background
    const nextBgKey = `background0${this.backgroundIndex}`;
    this.backgroundIndex = changeIndexState(this.backgroundIndex);

    // Create fade effect (simplified version of original)
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

    // Create ground platform
    const ground = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height - 50,
      this.scale.width,
      100,
      0x8B4513
    );
    ground.setOrigin(0.5, 0.5);

    // Add physics body
    this.physics.add.existing(ground, true);
    this.platforms.add(ground);
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
      if (!GameManager.instance.isGameOver) {
        GameManager.instance.setIsPaused(true);
      }
    });
  }

  private createPauseMenu(): void {
    // Create pause background
    this.pauseBackground = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.8
    );
    this.pauseBackground.setVisible(false);

    // Create pause menu container
    this.pauseMenu = this.add.container(this.scale.width / 2, this.scale.height / 2);

    // Resume button
    const resumeButton = this.createMenuButton(
      0, -this.MENU_BUTTONS.RESUME.HEIGHT - 35,
      this.MENU_BUTTONS.RESUME.TEXT,
      this.MENU_BUTTONS.RESUME,
      () => GameManager.instance.setIsPaused(false)
    );

    // Restart button
    const restartButton = this.createMenuButton(
      0, this.MENU_BUTTONS.RESTART.HEIGHT / 2,
      this.MENU_BUTTONS.RESTART.TEXT,
      this.MENU_BUTTONS.RESTART,
      () => this.scene.start('GameScene')
    );

    // Back button
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

    // Background
    const bg = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.8);

    // Popup background
    const popup = this.add.rectangle(0, 0, 600, 400, 0x2c3e50);
    popup.setStrokeStyle(3, 0x34495e);

    // Title
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

    // Score text (will be updated)
    const scoreText = this.add.text(0, -50, '', {
      fontSize: '24px',
      color: '#ecf0f1',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Restart button
    const restartBtn = this.createMenuButton(
      -75, 50,
      'Restart',
      { WIDTH: 150, HEIGHT: 60, BACKGROUND_COLOR: '#3498db', HOVER_COLOR: '#2980b9', TEXT_COLOR: '#ffffff' },
      () => {
        GameManager.instance.reset();
        this.scene.start('GameScene');
      }
    );

    // High scores button
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

    // Store score text for updates
    (this.gameOverUI as any).scoreText = scoreText;
  }

  private showGameOver(): void {
    // Update score display
    const scoreText = (this.gameOverUI as any).scoreText;
    scoreText.setText(`Your Score: ${Math.floor(this.timeElapsed)} points`);

    // Save high score
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
        // Remove enemy on hit if player doesn't die
        enemySprite.destroy();
      }
    });
  }

  private setupPauseCallbacks(): void {
    GameManager.instance.addPauseCallback(() => {
      this.pauseBackground.setVisible(true);
      this.pauseMenu.setVisible(true);
      this.physics.pause();
      this.backgroundInterval.paused = true;
    });

    GameManager.instance.addResumeCallback(() => {
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
