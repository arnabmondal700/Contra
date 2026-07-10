// src/systems/InputSystem.ts
import Phaser from "phaser";
import { InputState } from "../types/InputState";
import { INPUT_CONFIG } from "../config/InputConfig";

export class InputSystem {
  private scene: Phaser.Scene;
  private player1Input: InputState;
  private player2Input: InputState;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wKey!: Phaser.Input.Keyboard.Key;
  private aKey!: Phaser.Input.Keyboard.Key;
  private sKey!: Phaser.Input.Keyboard.Key;
  private dKey!: Phaser.Input.Keyboard.Key;
  private tabKey!: Phaser.Input.Keyboard.Key;
  private shiftKey!: Phaser.Input.Keyboard.Key;
  private escKey!: Phaser.Input.Keyboard.Key;
  private zKey!: Phaser.Input.Keyboard.Key;
  private xKey!: Phaser.Input.Keyboard.Key;
  private gamepad1: Phaser.Input.Gamepad.Gamepad | null = null;
  private gamepad2: Phaser.Input.Gamepad.Gamepad | null = null;
  private hasTouch = false;
  private touchControls?: {
    left: Phaser.GameObjects.Zone;
    right: Phaser.GameObjects.Zone;
    up: Phaser.GameObjects.Zone;
    down: Phaser.GameObjects.Zone;
    fire: Phaser.GameObjects.Zone;
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.player1Input = this.createEmptyInputState();
    this.player2Input = this.createEmptyInputState();
    this.setupKeyboard();
    this.setupGamepad();
    this.detectTouch();
  }

  private createEmptyInputState(): InputState {
    return {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      fire: false,
      pause: false,
    };
  }

  private setupKeyboard(): void {
    // Player 1: Arrow keys
    this.cursors = this.scene.input.keyboard!.createCursorKeys();

    // Player 2: WASD + action keys
    const keyboard = this.scene.input.keyboard!;
    this.wKey = keyboard.addKey(INPUT_CONFIG.player2.up);
    this.aKey = keyboard.addKey(INPUT_CONFIG.player2.left);
    this.sKey = keyboard.addKey(INPUT_CONFIG.player2.down);
    this.dKey = keyboard.addKey(INPUT_CONFIG.player2.right);
    this.tabKey = keyboard.addKey(INPUT_CONFIG.player2.jump);
    this.shiftKey = keyboard.addKey(INPUT_CONFIG.player2.fire);
    this.escKey = keyboard.addKey(INPUT_CONFIG.player1.pause);
    this.zKey = keyboard.addKey(INPUT_CONFIG.player1.jump);
    this.xKey = keyboard.addKey(INPUT_CONFIG.player1.fire);
  }

  private setupGamepad(): void {
    // Listen for gamepad connections
    this.scene.input.gamepad!.once("connected", (gamepad: Phaser.Input.Gamepad.Gamepad) => {
      if (!this.gamepad1) {
        this.gamepad1 = gamepad;
        console.log("[InputSystem] Gamepad 1 connected:", gamepad.id);
      } else if (!this.gamepad2) {
        this.gamepad2 = gamepad;
        console.log("[InputSystem] Gamepad 2 connected:", gamepad.id);
      }
    });

    this.scene.input.gamepad!.once("disconnected", (gamepad: Phaser.Input.Gamepad.Gamepad) => {
      if (this.gamepad1 === gamepad) {
        this.gamepad1 = null;
        console.log("[InputSystem] Gamepad 1 disconnected");
      } else if (this.gamepad2 === gamepad) {
        this.gamepad2 = null;
        console.log("[InputSystem] Gamepad 2 disconnected");
      }
    });

    // Check for already connected gamepads
    const gamepads = navigator.getGamepads();
    for (const gp of gamepads) {
      if (gp) {
        if (!this.gamepad1) this.gamepad1 = this.scene.input.gamepad!.getPad(gp.index);
        else if (!this.gamepad2) this.gamepad2 = this.scene.input.gamepad!.getPad(gp.index);
      }
    }
  }

  update(): void {
    this.updateKeyboard();
    this.updateGamepad();
  }

  private updateKeyboard(): void {
    // Player 1: Arrow keys + Z/X
    this.player1Input.left = this.cursors.left.isDown;
    this.player1Input.right = this.cursors.right.isDown;
    this.player1Input.up = this.cursors.up.isDown;
    this.player1Input.down = this.cursors.down.isDown;
    this.player1Input.jump = this.zKey.isDown;
    this.player1Input.fire = this.xKey.isDown;
    this.player1Input.pause = this.escKey.isDown;

    // Player 2: WASD + Tab/Shift
    this.player2Input.left = this.aKey.isDown;
    this.player2Input.right = this.dKey.isDown;
    this.player2Input.up = this.wKey.isDown;
    this.player2Input.down = this.sKey.isDown;
    this.player2Input.jump = this.tabKey.isDown;
    this.player2Input.fire = this.shiftKey.isDown;
    this.player2Input.pause = this.escKey.isDown;
  }

  private updateGamepad(): void {
    const deadzone = INPUT_CONFIG.gamepad.deadzone;

    // Player 1 gamepad
    if (this.gamepad1) {
      const leftStickX = this.gamepad1.axes[INPUT_CONFIG.gamepad.leftStickX]?.getValue() ?? 0;
      const leftStickY = this.gamepad1.axes[INPUT_CONFIG.gamepad.leftStickY]?.getValue() ?? 0;

      this.player1Input.left = leftStickX < -deadzone;
      this.player1Input.right = leftStickX > deadzone;
      this.player1Input.up = leftStickY < -deadzone;
      this.player1Input.down = leftStickY > deadzone;
      this.player1Input.jump = this.gamepad1.buttons[INPUT_CONFIG.gamepad.jumpButton]?.pressed ?? false;
      this.player1Input.fire = this.gamepad1.buttons[INPUT_CONFIG.gamepad.fireButton]?.pressed ?? false;
      this.player1Input.pause = this.gamepad1.buttons[INPUT_CONFIG.gamepad.pauseButton]?.pressed ?? false;
    }

    // Player 2 gamepad
    if (this.gamepad2) {
      const leftStickX = this.gamepad2.axes[INPUT_CONFIG.gamepad.leftStickX]?.getValue() ?? 0;
      const leftStickY = this.gamepad2.axes[INPUT_CONFIG.gamepad.leftStickY]?.getValue() ?? 0;

      this.player2Input.left = leftStickX < -deadzone;
      this.player2Input.right = leftStickX > deadzone;
      this.player2Input.up = leftStickY < -deadzone;
      this.player2Input.down = leftStickY > deadzone;
      this.player2Input.jump = this.gamepad2.buttons[INPUT_CONFIG.gamepad.jumpButton]?.pressed ?? false;
      this.player2Input.fire = this.gamepad2.buttons[INPUT_CONFIG.gamepad.fireButton]?.pressed ?? false;
      this.player2Input.pause = this.gamepad2.buttons[INPUT_CONFIG.gamepad.pauseButton]?.pressed ?? false;
    }
  }

  getPlayer1Input(): InputState {
    return this.player1Input;
  }

  getPlayer2Input(): InputState {
    return this.player2Input;
  }

  hasGamepad1(): boolean {
    return this.gamepad1 !== null;
  }

  hasGamepad2(): boolean {
    return this.gamepad2 !== null;
  }

  hasTouchInput(): boolean {
    return this.hasTouch;
  }

  private detectTouch(): void {
    this.hasTouch = ("ontouchstart" in window) || (navigator.maxTouchPoints > 0);
    if (this.hasTouch) {
      console.log("[InputSystem] Touch input detected");
    }
  }

  createTouchControls(): void {
    if (!this.hasTouch) return;
    const { width, height } = this.scene.cameras.main;
    const padSize = 64;
    const margin = 24;
    const bottomY = height - margin - padSize / 2;
    const leftX = margin + padSize / 2;
    const rightX = margin + padSize + 8 + padSize / 2;

    const style = { fillColor: 0xffffff, fillAlpha: 0.15 };

    this.touchControls = {
      left: this.createTouchZone(leftX - padSize / 2, bottomY - padSize, padSize, padSize, style, "◀"),
      right: this.createTouchZone(rightX - padSize / 2, bottomY - padSize, padSize, padSize, style, "▶"),
      up: this.createTouchZone(leftX - padSize / 2, bottomY - padSize * 2 - 8, padSize, padSize, style, "▲"),
      down: this.createTouchZone(rightX - padSize / 2, bottomY - padSize * 2 - 8, padSize, padSize, style, "▼"),
      fire: this.createTouchZone(width - margin - 80, bottomY - 40, 80, 80, { fillColor: 0xff4444, fillAlpha: 0.25 }, "FIRE"),
    };
  }

  private createTouchZone(
    x: number,
    y: number,
    w: number,
    h: number,
    style: { fillColor: number; fillAlpha: number },
    label: string
  ): Phaser.GameObjects.Zone {
    const zone = this.scene.add.zone(x + w / 2, y + h / 2, w, h) as Phaser.GameObjects.Zone;
    const bg = this.scene.add.graphics();
    bg.fillStyle(style.fillColor, style.fillAlpha);
    bg.fillRect(x, y, w, h);
    bg.setScrollFactor(0);
    bg.setDepth(998);
    zone.setScrollFactor(0);
    zone.setDepth(999);

    this.scene.add
      .text(x + w / 2, y + h / 2, label, {
        font: "14px monospace",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000);

    zone.on("pointerdown", () => {
      this.player1Input[this.zoneToInput(label)] = true;
    });
    zone.on("pointerup", () => {
      this.player1Input[this.zoneToInput(label)] = false;
    });
    zone.on("pointerout", () => {
      this.player1Input[this.zoneToInput(label)] = false;
    });

    return zone;
  }

  private zoneToInput(label: string): keyof InputState {
    switch (label) {
      case "◀":
        return "left";
      case "▶":
        return "right";
      case "▲":
        return "up";
      case "▼":
        return "down";
      case "FIRE":
        return "fire";
      default:
        return "fire";
    }
  }

  destroyTouchControls(): void {
    if (!this.touchControls) return;
    Object.values(this.touchControls).forEach((zone) => {
      zone.destroy();
    });
    this.touchControls = undefined;
  }
}