import Phaser from 'phaser';

export interface SliderConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  handleSize: number;
  initialValue: number;
  trackColor: number;
  fillColor: number;
  handleColor: number;
  handleBorderColor: number;
  onValueChange: (value: number) => void;
}

export class SliderComponent extends Phaser.GameObjects.Container {
  private config: SliderConfig;
  private track!: Phaser.GameObjects.Graphics;
  private fill!: Phaser.GameObjects.Graphics;
  private handle!: Phaser.GameObjects.Graphics;
  private sliderZone!: Phaser.GameObjects.Zone;
  private isDragging: boolean = false;
  private currentValue: number;

  constructor(scene: Phaser.Scene, config: SliderConfig) {
    super(scene, config.x, config.y);

    this.config = config;
    this.currentValue = config.initialValue;

    this.createSliderComponents();
    this.setupInteractions();

    scene.add.existing(this);
  }

  private createSliderComponents(): void {
    this.track = this.scene.add.graphics();
    this.track.fillStyle(this.config.trackColor, 1);
    this.track.fillRoundedRect(
      -this.config.width / 2,
      -this.config.height / 2,
      this.config.width,
      this.config.height,
      3
    );

    this.fill = this.scene.add.graphics();
    this.updateFill(this.currentValue);

    this.handle = this.scene.add.graphics();
    this.updateHandle(this.currentValue);

    this.sliderZone = this.scene.add.zone(
      0,
      0,
      this.config.width + this.config.handleSize,
      this.config.handleSize + 10
    );
    this.sliderZone.setInteractive();

    this.add([this.track, this.fill, this.handle, this.sliderZone]);
  }

  private updateFill(value: number): void {
    this.fill.clear();
    this.fill.fillStyle(this.config.fillColor, 1);
    const fillWidth = this.config.width * value;
    this.fill.fillRoundedRect(
      -this.config.width / 2,
      -this.config.height / 2,
      fillWidth,
      this.config.height,
      3
    );
  }

  private updateHandle(value: number): void {
    this.handle.clear();
    this.handle.fillStyle(this.config.handleColor, 1);
    this.handle.lineStyle(2, this.config.handleBorderColor, 1);
    const handleX = -this.config.width / 2 + this.config.width * value;
    this.handle.fillCircle(handleX, 0, this.config.handleSize / 2);
    this.handle.strokeCircle(handleX, 0, this.config.handleSize / 2);
  }

  private setupInteractions(): void {
    const updateSlider = (pointer: Phaser.Input.Pointer) => {
      const localX = pointer.x - (this.x + this.scene.scale.width / 2);
      const sliderStart = -this.config.width / 2;
      const relativeX = localX - sliderStart;
      const newValue = Phaser.Math.Clamp(relativeX / this.config.width, 0, 1);

      if (newValue !== this.currentValue) {
        this.currentValue = newValue;
        this.updateFill(newValue);
        this.updateHandle(newValue);
        this.config.onValueChange(newValue);
        this.emit('valuechange', newValue);
      }
    };

    this.sliderZone.on('pointerover', () => {
      this.handle.clear();
      this.handle.fillStyle(this.config.fillColor, 1);
      this.handle.lineStyle(3, this.config.handleColor, 1);
      const handleX = -this.config.width / 2 + this.config.width * this.currentValue;
      this.handle.fillCircle(handleX, 0, this.config.handleSize / 2 + 1);
      this.handle.strokeCircle(handleX, 0, this.config.handleSize / 2 + 1);
    });

    this.sliderZone.on('pointerout', () => {
      if (!this.isDragging) {
        this.updateHandle(this.currentValue);
      }
    });

    this.sliderZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      updateSlider(pointer);
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        updateSlider(pointer);
      }
    });

    this.scene.input.on('pointerup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.updateHandle(this.currentValue);
      }
    });
  }

  public getValue(): number {
    return this.currentValue;
  }

  public setValue(value: number): void {
    this.currentValue = Phaser.Math.Clamp(value, 0, 1);
    this.updateFill(this.currentValue);
    this.updateHandle(this.currentValue);
  }
}

export default class SliderPlugin extends Phaser.Plugins.BasePlugin {
  constructor(pluginManager: Phaser.Plugins.PluginManager) {
    super(pluginManager);
  }

  public createSlider(scene: Phaser.Scene, config: SliderConfig): SliderComponent {
    return new SliderComponent(scene, config);
  }
}
