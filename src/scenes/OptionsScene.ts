import Phaser from 'phaser';
import { GameManager } from '../managers/GameManager';
import { AudioService } from '../services/AudioService';

export class OptionsScene extends Phaser.Scene {
  private readonly MENU_BUTTONS = {
    RESUME: {
      WIDTH: 200,
      HEIGHT: 60,
      TEXT: 'Resume Game',
      BACKGROUND_COLOR: '#34495e',
      HOVER_COLOR: '#2c3e50',
      TEXT_COLOR: '#ffffff',
    },
    RESTART: {
      WIDTH: 200,
      HEIGHT: 60,
      TEXT: 'Restart Game',
      BACKGROUND_COLOR: '#3498db',
      HOVER_COLOR: '#2980b9',
      TEXT_COLOR: '#ffffff',
    },
    BACK: {
      WIDTH: 200,
      HEIGHT: 60,
      TEXT: 'Back to Menu',
      BACKGROUND_COLOR: '#e74c3c',
      HOVER_COLOR: '#c0392b',
      TEXT_COLOR: '#ffffff',
    },
  };

  private readonly AUDIO_CONTROLS = {
    SLIDER_WIDTH: 200,
    SLIDER_HEIGHT: 6,
    SLIDER_HANDLE_SIZE: 18,
    TOGGLE_SIZE: 32,
  };

  private optionsBackground!: Phaser.GameObjects.Rectangle;
  private optionsMenu!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'OptionsScene' });
  }

  create() {
    this.createOptionsOverlay();
    this.createOptionsMenu();

    GameManager.getInstance().setIsPaused(true);
    this.scene.get('GameScene').scene.pause();
  }

  private createOptionsOverlay(): void {
    this.optionsBackground = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.8
    );
    this.optionsBackground.setDepth(1000);
  }

  private createOptionsMenu(): void {
    this.optionsMenu = this.add.container(this.scale.width / 2, this.scale.height / 2);

    const title = this.add
      .text(0, -180, 'GAME PAUSED', {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: 'rgba(0, 0, 0, 0.8)',
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    const audioTitle = this.add
      .text(0, -130, 'AUDIO SETTINGS', {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const musicControls = this.createVolumeControl(
      -80,
      'Music',
      () => AudioService.getInstance().getMusicVolume(),
      vol => AudioService.getInstance().setMusicVolume(vol),
      () => AudioService.getInstance().toggleMusic(),
      () => AudioService.getInstance().isMusicMuted()
    );

    const sfxControls = this.createVolumeControl(
      -40,
      'Sound',
      () => AudioService.getInstance().getSfxVolume(),
      vol => AudioService.getInstance().setSfxVolume(vol),
      () => AudioService.getInstance().toggleSfx(),
      () => AudioService.getInstance().isSfxMuted()
    );

    const resumeButton = this.createMenuButton(
      0,
      20,
      this.MENU_BUTTONS.RESUME.TEXT,
      this.MENU_BUTTONS.RESUME,
      () => this.resumeGame()
    );

    const restartButton = this.createMenuButton(
      0,
      90,
      this.MENU_BUTTONS.RESTART.TEXT,
      this.MENU_BUTTONS.RESTART,
      () => this.restartGame()
    );

    const backButton = this.createMenuButton(
      0,
      160,
      this.MENU_BUTTONS.BACK.TEXT,
      this.MENU_BUTTONS.BACK,
      () => this.backToMenu()
    );

    this.optionsMenu.add([
      title,
      audioTitle,
      musicControls,
      sfxControls,
      resumeButton,
      restartButton,
      backButton,
    ]);
    this.optionsMenu.setDepth(1001);
  }

  private createVolumeControl(
    y: number,
    label: string,
    getVolume: () => number,
    setVolume: (vol: number) => void,
    toggleMute: () => void,
    isMuted: () => boolean
  ): Phaser.GameObjects.Container {
    const container = this.add.container(0, y);

    const labelText = this.add
      .text(-160, 0, label, {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);

    const slider = this.plugins.get('SliderPlugin').createSlider(this, {
      x: 0,
      y: 0,
      width: this.AUDIO_CONTROLS.SLIDER_WIDTH,
      height: this.AUDIO_CONTROLS.SLIDER_HEIGHT,
      handleSize: this.AUDIO_CONTROLS.SLIDER_HANDLE_SIZE,
      initialValue: getVolume(),
      trackColor: 0x2c3e50,
      fillColor: 0x27ae60,
      handleColor: 0x27ae60,
      handleBorderColor: 0xffffff,
      onValueChange: setVolume,
    });

    const volumeText = this.add
      .text(120, 0, `${Math.round(getVolume() * 100)}%`, {
        fontSize: '14px',
        color: '#bdc3c7',
        fontStyle: 'bold',
      })
      .setOrigin(0, 0.5);

    const muteButton = this.add.graphics();
    const muteColor = isMuted() ? 0xe74c3c : 0x27ae60;
    muteButton.fillStyle(muteColor, 1);
    muteButton.lineStyle(2, 0xffffff, 0.8);
    muteButton.fillRoundedRect(
      170 - this.AUDIO_CONTROLS.TOGGLE_SIZE / 2,
      -this.AUDIO_CONTROLS.TOGGLE_SIZE / 2,
      this.AUDIO_CONTROLS.TOGGLE_SIZE,
      this.AUDIO_CONTROLS.TOGGLE_SIZE,
      6
    );
    muteButton.strokeRoundedRect(
      170 - this.AUDIO_CONTROLS.TOGGLE_SIZE / 2,
      -this.AUDIO_CONTROLS.TOGGLE_SIZE / 2,
      this.AUDIO_CONTROLS.TOGGLE_SIZE,
      this.AUDIO_CONTROLS.TOGGLE_SIZE,
      6
    );

    const muteIcon = this.add
      .text(170, 0, isMuted() ? '🔇' : '🔊', {
        fontSize: '14px',
      })
      .setOrigin(0.5);

    const muteHitArea = this.add.zone(
      170,
      0,
      this.AUDIO_CONTROLS.TOGGLE_SIZE,
      this.AUDIO_CONTROLS.TOGGLE_SIZE
    );
    muteHitArea.setInteractive();

    muteHitArea.on('pointerover', () => {
      muteButton.clear();
      const hoverColor = isMuted() ? 0xe74c3c : 0x27ae60;
      muteButton.fillStyle(hoverColor, 0.8);
      muteButton.lineStyle(3, 0xffffff, 1);
      muteButton.fillRoundedRect(
        170 - this.AUDIO_CONTROLS.TOGGLE_SIZE / 2,
        -this.AUDIO_CONTROLS.TOGGLE_SIZE / 2,
        this.AUDIO_CONTROLS.TOGGLE_SIZE,
        this.AUDIO_CONTROLS.TOGGLE_SIZE,
        6
      );
      muteButton.strokeRoundedRect(
        170 - this.AUDIO_CONTROLS.TOGGLE_SIZE / 2,
        -this.AUDIO_CONTROLS.TOGGLE_SIZE / 2,
        this.AUDIO_CONTROLS.TOGGLE_SIZE,
        this.AUDIO_CONTROLS.TOGGLE_SIZE,
        6
      );
      container.setScale(1.02);
    });

    muteHitArea.on('pointerout', () => {
      muteButton.clear();
      const normalColor = isMuted() ? 0xe74c3c : 0x27ae60;
      muteButton.fillStyle(normalColor, 1);
      muteButton.lineStyle(2, 0xffffff, 0.8);
      muteButton.fillRoundedRect(
        170 - this.AUDIO_CONTROLS.TOGGLE_SIZE / 2,
        -this.AUDIO_CONTROLS.TOGGLE_SIZE / 2,
        this.AUDIO_CONTROLS.TOGGLE_SIZE,
        this.AUDIO_CONTROLS.TOGGLE_SIZE,
        6
      );
      muteButton.strokeRoundedRect(
        170 - this.AUDIO_CONTROLS.TOGGLE_SIZE / 2,
        -this.AUDIO_CONTROLS.TOGGLE_SIZE / 2,
        this.AUDIO_CONTROLS.TOGGLE_SIZE,
        this.AUDIO_CONTROLS.TOGGLE_SIZE,
        6
      );
      container.setScale(1.0);
    });

    muteHitArea.on('pointerdown', () => {
      AudioService.getInstance().playButtonClick();
      toggleMute();

      muteButton.clear();
      const newColor = isMuted() ? 0xe74c3c : 0x27ae60;
      muteButton.fillStyle(newColor, 1);
      muteButton.lineStyle(2, 0xffffff, 0.8);
      muteButton.fillRoundedRect(
        170 - this.AUDIO_CONTROLS.TOGGLE_SIZE / 2,
        -this.AUDIO_CONTROLS.TOGGLE_SIZE / 2,
        this.AUDIO_CONTROLS.TOGGLE_SIZE,
        this.AUDIO_CONTROLS.TOGGLE_SIZE,
        6
      );
      muteButton.strokeRoundedRect(
        170 - this.AUDIO_CONTROLS.TOGGLE_SIZE / 2,
        -this.AUDIO_CONTROLS.TOGGLE_SIZE / 2,
        this.AUDIO_CONTROLS.TOGGLE_SIZE,
        this.AUDIO_CONTROLS.TOGGLE_SIZE,
        6
      );

      muteIcon.setText(isMuted() ? '🔇' : '🔊');
    });

    slider.on('valuechange', (value: number) => {
      volumeText.setText(`${Math.round(value * 100)}%`);
    });

    container.add([labelText, slider, volumeText, muteButton, muteIcon, muteHitArea]);
    return container;
  }

  private createMenuButton(
    x: number,
    y: number,
    text: string,
    config: any,
    onClick: () => void
  ): Phaser.GameObjects.Container {
    const button = this.add.container(x, y);

    const bg = this.add.rectangle(
      0,
      0,
      config.WIDTH,
      config.HEIGHT,
      Phaser.Display.Color.HexStringToColor(config.BACKGROUND_COLOR).color
    );

    const buttonText = this.add
      .text(0, 0, text, {
        fontSize: '18px',
        color: config.TEXT_COLOR,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    button.add([bg, buttonText]);
    button.setSize(config.WIDTH, config.HEIGHT);
    button.setInteractive();

    button.on('pointerover', () => {
      bg.setFillStyle(Phaser.Display.Color.HexStringToColor(config.HOVER_COLOR).color);
      button.setScale(1.05);
      AudioService.getInstance().playButtonHover();
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
      AudioService.getInstance().playButtonClick();
      onClick();
    });

    return button;
  }

  private resumeGame(): void {
    GameManager.getInstance().setIsPaused(false);
    this.scene.get('GameScene').scene.resume();
    this.scene.stop();
  }

  private restartGame(): void {
    GameManager.getInstance().reset();
    this.scene.stop();
    this.scene.start('GameScene');
  }

  private backToMenu(): void {
    GameManager.getInstance().reset();
    this.scene.stop();
    this.scene.get('GameScene').scene.stop();
    this.scene.start('StartScene');
    AudioService.getInstance().playMenuMusic();
  }
}
