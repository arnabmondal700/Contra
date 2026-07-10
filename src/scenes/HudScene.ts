// scenes/HudScene.ts
import Phaser from "phaser";

export class HudScene extends Phaser.Scene {
  constructor() {
    super({ key: "hud" });
  }

  create(): void {
    console.log("[HudScene] HUD overlay initialized");
    // HUD components will be added in later phases
  }

  update(): void {
    // HUD updates will go here
  }
}
