import Phaser from 'phaser';

interface TouchButton {
  container: Phaser.GameObjects.Container;
  background: Phaser.GameObjects.Graphics;
  icon: Phaser.GameObjects.Graphics;
  isPressed: boolean;
  activeTouches: Set<number>;
  bounds: Phaser.Geom.Rectangle;
}

export class MobileControls {
  private scene: Phaser.Scene;
  private leftButton: TouchButton;
  private rightButton: TouchButton;
  private jumpButton: TouchButton;

  private readonly BUTTON_CONFIG = {
    MOVEMENT: {
      SIZE: 120,
      POSITION_Y_OFFSET: 120,
      LEFT_X_OFFSET: 100,
      RIGHT_X_OFFSET: 300,
      COLORS: {
        BACKGROUND: 0x2c3e50,
        BACKGROUND_PRESSED: 0x34495e,
        BORDER: 0x3498db,
        ICON: 0xecf0f1,
      },
    },
    JUMP: {
      SIZE: 120,
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
    this.setupGlobalTouchHandling();
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
    container.setDepth(1000);

    const bounds = new Phaser.Geom.Rectangle(x - size / 2, y - size / 2, size, size);

    return {
      container,
      background,
      icon,
      isPressed: false,
      activeTouches: new Set<number>(),
      bounds,
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

  private setupGlobalTouchHandling(): void {
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.handleTouchStart(pointer);
    });

    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      this.handleTouchEnd(pointer);
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.handleTouchMove(pointer);
    });

    this.scene.input.on('pointerupoutside', (pointer: Phaser.Input.Pointer) => {
      this.handleTouchEnd(pointer);
    });
  }

  private handleTouchStart(pointer: Phaser.Input.Pointer): void {
    const touchId = pointer.id;
    const x = pointer.x;
    const y = pointer.y;

    if (this.isPointInButton(x, y, this.leftButton)) {
      this.onButtonPress(this.leftButton, 'left', this.BUTTON_CONFIG.MOVEMENT.COLORS, touchId);
    }

    if (this.isPointInButton(x, y, this.rightButton)) {
      this.onButtonPress(this.rightButton, 'right', this.BUTTON_CONFIG.MOVEMENT.COLORS, touchId);
    }

    if (this.isPointInButton(x, y, this.jumpButton)) {
      this.onButtonPress(this.jumpButton, 'jump', this.BUTTON_CONFIG.JUMP.COLORS, touchId);
    }
  }

  private handleTouchEnd(pointer: Phaser.Input.Pointer): void {
    const touchId = pointer.id;

    this.onButtonRelease(this.leftButton, 'left', this.BUTTON_CONFIG.MOVEMENT.COLORS, touchId);
    this.onButtonRelease(this.rightButton, 'right', this.BUTTON_CONFIG.MOVEMENT.COLORS, touchId);
    this.onButtonRelease(this.jumpButton, 'jump', this.BUTTON_CONFIG.JUMP.COLORS, touchId);
  }

  private handleTouchMove(pointer: Phaser.Input.Pointer): void {
    const touchId = pointer.id;
    const x = pointer.x;
    const y = pointer.y;

    this.checkTouchOutOfBounds(
      x,
      y,
      touchId,
      this.leftButton,
      'left',
      this.BUTTON_CONFIG.MOVEMENT.COLORS
    );
    this.checkTouchOutOfBounds(
      x,
      y,
      touchId,
      this.rightButton,
      'right',
      this.BUTTON_CONFIG.MOVEMENT.COLORS
    );
    this.checkTouchOutOfBounds(
      x,
      y,
      touchId,
      this.jumpButton,
      'jump',
      this.BUTTON_CONFIG.JUMP.COLORS
    );
  }

  private checkTouchOutOfBounds(
    x: number,
    y: number,
    touchId: number,
    button: TouchButton,
    buttonType: 'left' | 'right' | 'jump',
    colors: any
  ): void {
    if (button.activeTouches.has(touchId) && !this.isPointInButton(x, y, button)) {
      this.onButtonRelease(button, buttonType, colors, touchId);
    }
  }

  private isPointInButton(x: number, y: number, button: TouchButton): boolean {
    return Phaser.Geom.Rectangle.Contains(button.bounds, x, y);
  }

  private onButtonPress(
    button: TouchButton,
    buttonType: 'left' | 'right' | 'jump',
    colors: any,
    touchId: number
  ): void {
    button.activeTouches.add(touchId);

    if (!button.isPressed) {
      button.isPressed = true;

      this.updateButtonStyle({
        button,
        backgroundColor: colors.BACKGROUND_PRESSED,
        borderColor: colors.BORDER,
        size:
          buttonType === 'jump' ? this.BUTTON_CONFIG.JUMP.SIZE : this.BUTTON_CONFIG.MOVEMENT.SIZE,
        opacity: this.BUTTON_CONFIG.OPACITY.PRESSED,
      });

      button.container.setScale(0.95);
      this.updateButtonState(buttonType, true);
    }
  }

  private onButtonRelease(
    button: TouchButton,
    buttonType: 'left' | 'right' | 'jump',
    colors: any,
    touchId: number
  ): void {
    button.activeTouches.delete(touchId);

    if (button.activeTouches.size === 0 && button.isPressed) {
      button.isPressed = false;

      this.updateButtonStyle({
        button,
        backgroundColor: colors.BACKGROUND,
        borderColor: colors.BORDER,
        size:
          buttonType === 'jump' ? this.BUTTON_CONFIG.JUMP.SIZE : this.BUTTON_CONFIG.MOVEMENT.SIZE,
        opacity: this.BUTTON_CONFIG.OPACITY.NORMAL,
      });

      button.container.setScale(1.0);
      this.updateButtonState(buttonType, false);
    }
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
    const leftX = this.BUTTON_CONFIG.MOVEMENT.LEFT_X_OFFSET;
    const leftY = this.scene.cameras.main.height - this.BUTTON_CONFIG.MOVEMENT.POSITION_Y_OFFSET;
    const rightX = this.BUTTON_CONFIG.MOVEMENT.RIGHT_X_OFFSET;
    const rightY = this.scene.cameras.main.height - this.BUTTON_CONFIG.MOVEMENT.POSITION_Y_OFFSET;
    const jumpX = this.scene.cameras.main.width - this.BUTTON_CONFIG.JUMP.RIGHT_X_OFFSET;
    const jumpY = this.scene.cameras.main.height - this.BUTTON_CONFIG.JUMP.POSITION_Y_OFFSET;

    this.leftButton.container.setPosition(leftX, leftY);
    this.rightButton.container.setPosition(rightX, rightY);
    this.jumpButton.container.setPosition(jumpX, jumpY);

    const leftSize = this.BUTTON_CONFIG.MOVEMENT.SIZE;
    const jumpSize = this.BUTTON_CONFIG.JUMP.SIZE;

    this.leftButton.bounds.setTo(leftX - leftSize / 2, leftY - leftSize / 2, leftSize, leftSize);
    this.rightButton.bounds.setTo(rightX - leftSize / 2, rightY - leftSize / 2, leftSize, leftSize);
    this.jumpButton.bounds.setTo(jumpX - jumpSize / 2, jumpY - jumpSize / 2, jumpSize, jumpSize);
  }

  public setVisible(visible: boolean): void {
    this.leftButton.container.setVisible(visible);
    this.rightButton.container.setVisible(visible);
    this.jumpButton.container.setVisible(visible);
  }

  public destroy(): void {
    this.scene.input.off('pointerdown');
    this.scene.input.off('pointerup');
    this.scene.input.off('pointermove');
    this.scene.input.off('pointerupoutside');

    this.leftButton.container.destroy();
    this.rightButton.container.destroy();
    this.jumpButton.container.destroy();
  }
}
