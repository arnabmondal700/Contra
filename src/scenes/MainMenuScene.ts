// scenes/MainMenuScene.ts
import Phaser from "phaser";

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "mainmenu" });
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Title
    this.add
      .text(width / 2, height / 3, "CONTRA CLONE", {
        font: "48px monospace",
        color: "#ff4444",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(width / 2, height / 3 + 60, "A Phaser 3 Tribute", {
        font: "16px monospace",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    // Start prompt
    const startText = this.add
      .text(width / 2, height * 0.7, "PRESS ENTER TO START", {
        font: "20px monospace",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Blink the start text
    this.tweens.add({
      targets: startText,
      alpha: 0.2,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Controls info
    this.add
      .text(width / 2, height * 0.85, "P1: Arrow Keys + Z (Jump) + X (Fire)", {
        font: "12px monospace",
        color: "#666666",
      })
      .setOrigin(0.5);

    // Input handler
    this.input.keyboard!.once("keydown-ENTER", () => {
      this.scene.start("stage", { stageId: "stage1", playerCount: 1 });
    });

    this.input.keyboard!.once("keydown-SPACE", () => {
      this.scene.start("stage", { stageId: "stage1", playerCount: 1 });
    });
  }
}
