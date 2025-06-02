import Phaser from 'phaser';

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoadingScene' });
  }

  preload() {
    this.createLoadingUI();

    this.loadGameAssets();
  }

  create() {
    this.createAnimations();

    this.time.delayedCall(500, () => {
      this.scene.start('StartScene');
    });
  }

  private createLoadingUI() {
    this.add.rectangle(360, 640, 720, 1280, 0x2c3e50);

    this.add.text(360, 400, 'DODGE THE SPIKE', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(360, 470, 'Loading...', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const loadingBarBg = this.add.rectangle(360, 640, 400, 30, 0x34495e);
    loadingBarBg.setStrokeStyle(2, 0xffffff);

    const loadingBar = this.add.rectangle(360, 640, 396, 26, 0x3498db);
    loadingBar.scaleX = 0;

    const loadingText = this.add.text(360, 700, 'Loading Assets... 0%', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.load.on('progress', (progress: number) => {
      loadingBar.scaleX = progress;
      loadingText.setText(`Loading Assets... ${Math.round(progress * 100)}%`);
    });

    this.load.on('complete', () => {
      loadingText.setText('Loading Complete!');
    });
  }

  private loadGameAssets() {
    this.load.image('background01', 'assets/sprites/background01.jpg');
    this.load.image('background02', 'assets/sprites/background02.jpg');
    this.load.image('ground', 'assets/sprites/ground.jpg');

    this.load.spritesheet('player_idle', 'assets/animations/player/idle/player_idle.png', {
      frameWidth: 32,
      frameHeight: 48
    });
    this.load.spritesheet('player_jump', 'assets/animations/player/jump/player_jump.png', {
      frameWidth: 32,
      frameHeight: 48
    });
    this.load.spritesheet('player_run', 'assets/animations/player/run/player_run.png', {
      frameWidth: 32,
      frameHeight: 48
    });

    this.load.on('loaderror', (file: any) => {
      console.warn(`Failed to load asset: ${file.key} from ${file.url}`);
    });
  }

  private createAnimations() {
    if (this.textures.exists('player_idle') && this.textures.get('player_idle').frameTotal > 1) {
      this.anims.create({
        key: 'player_idle',
        frames: this.anims.generateFrameNumbers('player_idle', { start: 0, end: this.textures.get('player_idle').frameTotal - 1 }),
        frameRate: 8,
        repeat: -1
      });
    } else {
      this.anims.create({
        key: 'player_idle',
        frames: [{ key: 'player_idle', frame: 0 }],
        frameRate: 8,
        repeat: -1
      });
    }

    if (this.textures.exists('player_jump') && this.textures.get('player_jump').frameTotal > 1) {
      this.anims.create({
        key: 'player_jump',
        frames: this.anims.generateFrameNumbers('player_jump', { start: 0, end: this.textures.get('player_jump').frameTotal - 1 }),
        frameRate: 12,
        repeat: 0
      });
    } else {
      this.anims.create({
        key: 'player_jump',
        frames: [{ key: 'player_jump', frame: 0 }],
        frameRate: 12,
        repeat: 0
      });
    }

    if (this.textures.exists('player_run') && this.textures.get('player_run').frameTotal > 1) {
      this.anims.create({
        key: 'player_run',
        frames: this.anims.generateFrameNumbers('player_run', { start: 0, end: this.textures.get('player_run').frameTotal - 1 }),
        frameRate: 12,
        repeat: -1
      });
    } else {
      this.anims.create({
        key: 'player_run',
        frames: [{ key: 'player_run', frame: 0 }],
        frameRate: 12,
        repeat: -1
      });
    }
  }
}
