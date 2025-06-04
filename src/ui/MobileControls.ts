import Phaser from 'phaser';

interface TouchButton {
  container: Phaser.GameObjects.Container;
  background: Phaser.GameObjects.Graphics;
  icon: Phaser.GameObjects.Graphics;
  isPressed: boolean;
}

export class MobileControls {
  private scene: Phaser.Scene;
  private leftButton: TouchButton;
  private rightButton: TouchButton;
  private jumpButton: TouchButton;

  private readonly BUTTON_CONFIG = {
    MOVEMENT: {
      SIZE: 80,
      POSITION_Y_OFFSET: 120,
      LEFT_X_OFFSET: 100,
      RIGHT_X_OFFSET: 200,
      COLORS: {
        BACKGROUND: 0x2c3e50,
        BACKGROUND_PRESSED: 0x34495e,
        BORDER: 0x3498db,
        ICON: 0xecf0f1,
      },
    },
    JUMP: {
      SIZE: 90,
      POSITION_Y_OFFSET: 120,
      RIGHT_X_OFFSET: 100,
      COLORS: {
        BACKGROUND: 0xe74c3c,
        BACKGROUND_PRESSED: 0xc0392b,
        BORDER: 0xf39c12,
        ICON: 0xecf0f1,
      },
    },
    OPACITY: {
      NORMAL: 0.7,
      PRESSED: 0.9,
    },
  };

  public leftPressed: boolean = false;
  public rightPressed: boolean = false;
  public jumpPressed: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.leftButton = this.createLeftButton();
    this.rightButton = this.createRightButton();
    this.jumpButton = this.createJumpButton();
    this.setupEventListeners();
  }

  private createLeftButton(): TouchButton {
    const button = this.createButton(
      this.BUTTON_CONFIG.MOVEMENT.LEFT_X_OFFSET,
      this.scene.scale.height - this.BUTTON_CONFIG.MOVEMENT.POSITION_Y_OFFSET,
      this.BUTTON_CONFIG.MOVEMENT.SIZE,
      this.BUTTON_CONFIG.MOVEMENT.COLORS
    );

    this.drawLeftArrow(button.icon, this.BUTTON_CONFIG.MOVEMENT.SIZE);

    return button;
  }

  private createRightButton(): TouchButton {
    const button = this.createButton(
      this.BUTTON_CONFIG.MOVEMENT.RIGHT_X_OFFSET,
      this.scene.scale.height - this.BUTTON_CONFIG.MOVEMENT.POSITION_Y_OFFSET,
      this.BUTTON_CONFIG.MOVEMENT.SIZE,
      this.BUTTON_CONFIG.MOVEMENT.COLORS
    );

    this.drawRightArrow(button.icon, this.BUTTON_CONFIG.MOVEMENT.SIZE);

    return button;
  }

  private createJumpButton(): TouchButton {
    const button = this.createButton(
      this.scene.scale.width - this.BUTTON_CONFIG.JUMP.RIGHT_X_OFFSET,
      this.scene.scale.height - this.BUTTON_CONFIG.JUMP.POSITION_Y_OFFSET,
      this.BUTTON_CONFIG.JUMP.SIZE,
      this.BUTTON_CONFIG.JUMP.COLORS
    );

    this.drawJumpIcon(button.icon, this.BUTTON_CONFIG.JUMP.SIZE);

    return button;
  }

  private createButton(x: number, y: number, size: number, colors: any): TouchButton {
    const container = this.scene.add.container(x, y);

    const background = this.scene.add.graphics();
    background.fillStyle(colors.BACKGROUND, this.BUTTON_CONFIG.OPACITY.NORMAL);
    background.lineStyle(3, colors.BORDER, 1);
    background.fillCircle(0, 0, size / 2);
    background.strokeCircle(0, 0, size / 2);

    const icon = this.scene.add.graphics();
    icon.lineStyle(4, colors.ICON, 1);

    container.add([background, icon]);
    container.setSize(size, size);
    container.setInteractive();
    container.setDepth(1000);

    return {
      container,
      background,
      icon,
      isPressed: false,
    };
  }

  private drawLeftArrow(graphics: Phaser.GameObjects.Graphics, size: number): void {
    const arrowSize = size * 0.3;
    graphics.beginPath();
    graphics.moveTo(-arrowSize / 2, 0);
    graphics.lineTo(arrowSize / 2, -arrowSize / 2);
    graphics.moveTo(-arrowSize / 2, 0);
    graphics.lineTo(arrowSize / 2, arrowSize / 2);
    graphics.strokePath();
  }

  private drawRightArrow(graphics: Phaser.GameObjects.Graphics, size: number): void {
    const arrowSize = size * 0.3;
    graphics.beginPath();
    graphics.moveTo(arrowSize / 2, 0);
    graphics.lineTo(-arrowSize / 2, -arrowSize / 2);
    graphics.moveTo(arrowSize / 2, 0);
    graphics.lineTo(-arrowSize / 2, arrowSize / 2);
    graphics.strokePath();
  }

  private drawJumpIcon(graphics: Phaser.GameObjects.Graphics, size: number): void {
    const arrowSize = size * 0.35;
    graphics.beginPath();
    graphics.moveTo(0, -arrowSize / 2);
    graphics.lineTo(-arrowSize / 2, arrowSize / 4);
    graphics.moveTo(0, -arrowSize / 2);
    graphics.lineTo(arrowSize / 2, arrowSize / 4);
    graphics.moveTo(0, -arrowSize / 2);
    graphics.lineTo(0, arrowSize / 2);
    graphics.strokePath();
  }

  private setupEventListeners(): void {
    this.setupButtonEvents(this.leftButton, 'left');

    this.setupButtonEvents(this.rightButton, 'right');

    this.setupButtonEvents(this.jumpButton, 'jump');
  }

  private setupButtonEvents(button: TouchButton, buttonType: 'left' | 'right' | 'jump'): void {
    const colors =
      buttonType === 'jump' ? this.BUTTON_CONFIG.JUMP.COLORS : this.BUTTON_CONFIG.MOVEMENT.COLORS;

    button.container.on('pointerdown', () => {
      this.onButtonPress(button, buttonType, colors);
    });

    button.container.on('pointerup', () => {
      this.onButtonRelease(button, buttonType, colors);
    });

    button.container.on('pointerout', () => {
      this.onButtonRelease(button, buttonType, colors);
    });

    button.container.on('touchstart', () => {
      this.onButtonPress(button, buttonType, colors);
    });

    button.container.on('touchend', () => {
      this.onButtonRelease(button, buttonType, colors);
    });

    button.container.on('touchcancel', () => {
      this.onButtonRelease(button, buttonType, colors);
    });
  }

  private onButtonPress(
    button: TouchButton,
    buttonType: 'left' | 'right' | 'jump',
    colors: any
  ): void {
    button.isPressed = true;

    this.updateButtonStyle({
      button,
      backgroundColor: colors.BACKGROUND_PRESSED,
      borderColor: colors.BORDER,
      size: buttonType === 'jump' ? this.BUTTON_CONFIG.JUMP.SIZE : this.BUTTON_CONFIG.MOVEMENT.SIZE,
      opacity: this.BUTTON_CONFIG.OPACITY.PRESSED,
    });

    button.container.setScale(0.95);

    this.updateButtonState(buttonType, true);
  }

  private onButtonRelease(
    button: TouchButton,
    buttonType: 'left' | 'right' | 'jump',
    colors: any
  ): void {
    button.isPressed = false;

    this.updateButtonStyle({
      button,
      backgroundColor: colors.BACKGROUND,
      borderColor: colors.BORDER,
      size: buttonType === 'jump' ? this.BUTTON_CONFIG.JUMP.SIZE : this.BUTTON_CONFIG.MOVEMENT.SIZE,
      opacity: this.BUTTON_CONFIG.OPACITY.NORMAL,
    });

    button.container.setScale(1.0);

    this.updateButtonState(buttonType, false);
  }

  private updateButtonStyle({
    button,
    backgroundColor,
    borderColor,
    size,
    opacity,
  }: {
    button: TouchButton;
    backgroundColor: number;
    borderColor: number;
    size: number;
    opacity: number;
  }): void {
    button.background.clear();
    button.background.fillStyle(backgroundColor, opacity);
    button.background.lineStyle(3, borderColor, 1);
    button.background.fillCircle(0, 0, size / 2);
    button.background.strokeCircle(0, 0, size / 2);

    button.container.setScale(1.0);
  }

  private updateButtonState(buttonType: 'left' | 'right' | 'jump', pressed: boolean): void {
    if (buttonType === 'left') {
      this.leftPressed = pressed;
    } else if (buttonType === 'right') {
      this.rightPressed = pressed;
    } else if (buttonType === 'jump') {
      this.jumpPressed = pressed;
    }
  }

  public update(): void {
    this.updateButtonPositions();
  }

  private updateButtonPositions(): void {
    this.leftButton.container.setPosition(
      this.BUTTON_CONFIG.MOVEMENT.LEFT_X_OFFSET,
      this.scene.cameras.main.height - this.BUTTON_CONFIG.MOVEMENT.POSITION_Y_OFFSET
    );

    this.rightButton.container.setPosition(
      this.BUTTON_CONFIG.MOVEMENT.RIGHT_X_OFFSET,
      this.scene.cameras.main.height - this.BUTTON_CONFIG.MOVEMENT.POSITION_Y_OFFSET
    );

    this.jumpButton.container.setPosition(
      this.scene.cameras.main.width - this.BUTTON_CONFIG.JUMP.RIGHT_X_OFFSET,
      this.scene.cameras.main.height - this.BUTTON_CONFIG.JUMP.POSITION_Y_OFFSET
    );
  }

  public setVisible(visible: boolean): void {
    this.leftButton.container.setVisible(visible);
    this.rightButton.container.setVisible(visible);
    this.jumpButton.container.setVisible(visible);
  }

  public destroy(): void {
    this.leftButton.container.destroy();
    this.rightButton.container.destroy();
    this.jumpButton.container.destroy();
  }
}
