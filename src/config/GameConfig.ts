// config/GameConfig.ts
import Phaser from "phaser";
import { BootScene } from "../scenes/BootScene";
import { PreloadScene } from "../scenes/PreloadScene";
import { MainMenuScene } from "../scenes/MainMenuScene";
import { StageScene } from "../scenes/StageScene";
import { BossScene } from "../scenes/BossScene";
import { VictoryScene } from "../scenes/VictoryScene";
import { GameOverScene } from "../scenes/GameOverScene";
import { HudScene } from "../scenes/HudScene";

export const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  backgroundColor: "#000000",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 900 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, PreloadScene, MainMenuScene, StageScene, BossScene, VictoryScene, GameOverScene, HudScene],
  input: {
    keyboard: true,
    gamepad: true,
    touch: true,
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
};
