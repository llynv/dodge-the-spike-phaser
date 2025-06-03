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
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;

    this.add.rectangle(centerX, centerY, screenWidth, screenHeight, 0x2c3e50);

    this.add.text(centerX, screenHeight * 0.3, 'DODGE THE SPIKE', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(centerX, screenHeight * 0.4, 'Loading...', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const loadingBarWidth = Math.min(400, screenWidth * 0.6);
    const loadingBarBg = this.add.rectangle(centerX, centerY, loadingBarWidth, 30, 0x34495e);
    loadingBarBg.setStrokeStyle(2, 0xffffff);

    const loadingBar = this.add.rectangle(centerX, centerY, loadingBarWidth - 4, 26, 0x3498db);
    loadingBar.scaleX = 0;

    const loadingText = this.add.text(centerX, screenHeight * 0.6, 'Loading Assets... 0%', {
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
      frameWidth: 155,
      frameHeight: 280
    });
    this.load.spritesheet('player_jump', 'assets/animations/player/jump/player_jump.png', {
      frameWidth: 155,
      frameHeight: 280
    });
    this.load.spritesheet('player_run', 'assets/animations/player/run/player_run.png', {
      frameWidth: 155,
      frameHeight: 280
    });
    this.load.spritesheet('enemy_fire', 'assets/animations/enemy/enemy_fire.png', {
      frameWidth: 48,
      frameHeight: 48
    });

    this.load.on('loaderror', (file: any) => {
      console.warn(`Failed to load asset: ${file.key} from ${file.url}`);
    });
  }

  private createAnimations() {
    this.createAnimation(
      'player_idle',
      'player_idle',
      20,
      -1
    );

    this.createAnimation(
      'player_jump',
      'player_jump',
      8,
      -1,
    );

    this.createAnimation(
      'player_run',
      'player_run',
      20,
      -1
    );

    this.createAnimation(
      'player_fall',
      'player_jump',
      8,
      -1,
      true
    );

    this.createAnimation(
      'enemy_fire',
      'enemy_fire',
      12,
      -1,
      false,
      8
    );
  }

  private createAnimation(
    animKey: string,
    textureKey: string,
    frameRate: number,
    repeat: number,
    useLastFrame: boolean = false,
    useLastNFrames?: number
  ) {
    if (this.textures.exists(textureKey) && this.textures.get(textureKey).frameTotal > 1) {
      let frames;
      if (useLastFrame) {
        const lastFrame = Math.max(0, this.textures.get(textureKey).frameTotal - 1);
        frames = this.anims.generateFrameNumbers(textureKey, { start: lastFrame, end: lastFrame });
      } else if (useLastNFrames) {
        const totalFrames = this.textures.get(textureKey).frameTotal - 1;
        const startFrame = Math.max(0, totalFrames - useLastNFrames);
        const endFrame = totalFrames - 1;
        frames = this.anims.generateFrameNumbers(textureKey, { start: startFrame, end: endFrame });
      } else {
        frames = this.anims.generateFrameNumbers(textureKey, { start: 0, end: this.textures.get(textureKey).frameTotal - 1 });
      }

      console.log(`Creating animation ${animKey} with ${frames.length} frames`);

      this.anims.create({
        key: animKey,
        frames: frames,
        frameRate: frameRate,
        repeat: repeat
      });
    } else {
      this.anims.create({
        key: animKey,
        frames: [{ key: textureKey, frame: 0 }],
        frameRate: frameRate,
        repeat: repeat
      });
    }
  }
}
