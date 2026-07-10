// src/config/InputConfig.ts
import Phaser from "phaser";

export const INPUT_CONFIG = {
  player1: {
    left: Phaser.Input.Keyboard.KeyCodes.LEFT,
    right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    up: Phaser.Input.Keyboard.KeyCodes.UP,
    down: Phaser.Input.Keyboard.KeyCodes.DOWN,
    jump: Phaser.Input.Keyboard.KeyCodes.Z,
    fire: Phaser.Input.Keyboard.KeyCodes.X,
    pause: Phaser.Input.Keyboard.KeyCodes.ESC,
  },
  player2: {
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    jump: Phaser.Input.Keyboard.KeyCodes.TAB,
    fire: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    pause: Phaser.Input.Keyboard.KeyCodes.ESC,
  },
  gamepad: {
    deadzone: 0.2,
    leftStickX: 0,
    leftStickY: 1,
    jumpButton: 0,
    fireButton: 1,
    pauseButton: 9,
  },
} as const;

export type PlayerInputConfig = typeof INPUT_CONFIG.player1;
export type GamepadInputConfig = typeof INPUT_CONFIG.gamepad;