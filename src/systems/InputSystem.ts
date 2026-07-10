// src/systems/InputSystem.ts
import Phaser from "phaser";
import { InputState } from "../types/InputState";
import { INPUT_CONFIG } from "../config/InputConfig";

export class InputSystem {
  private scene: Phaser.Scene;
  private player1Input: InputState;
  private player2Input: InputState;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private gamepad1: Phaser.Input.Gamepad.Gamepad | null = null;
  private gamepad2: Phaser.Input.Gamepad.Gamepad | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.player1Input = this.createEmptyInputState();
    this.player2Input = this.createEmptyInputState();
    this.setupKeyboard();
    this.setupGamepad();
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
    
    // Player 2: WASD
    this.wasdKeys = {
      w: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      tab: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TAB),
      shift: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      space: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      esc: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
      z: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
      x: this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.X),
    };
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
    this.player1Input.left = this.cursors.left?.isDown ?? false;
    this.player1Input.right = this.cursors.right?.isDown ?? false;
    this.player1Input.up = this.cursors.up?.isDown ?? false;
    this.player1Input.down = this.cursors.down?.isDown ?? false;
    this.player1Input.jump = this.wasdKeys.z?.isDown ?? false;
    this.player1Input.fire = this.wasdKeys.x?.isDown ?? false;
    this.player1Input.pause = this.wasdKeys.esc?.isDown ?? false;

    // Player 2: WASD + Tab/Shift
    this.player2Input.left = this.wasdKeys.a?.isDown ?? false;
    this.player2Input.right = this.wasdKeys.d?.isDown ?? false;
    this.player2Input.up = this.wasdKeys.w?.isDown ?? false;
    this.player2Input.down = this.wasdKeys.s?.isDown ?? false;
    this.player2Input.jump = this.wasdKeys.tab?.isDown ?? false;
    this.player2Input.fire = this.wasdKeys.shift?.isDown ?? false;
    this.player2Input.pause = this.wasdKeys.esc?.isDown ?? false;
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
}