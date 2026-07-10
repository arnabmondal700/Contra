// scenes/PauseScene.ts
import Phaser from "phaser";

export class PauseScene extends Phaser.Scene {
  private previousSceneKey = "";

  constructor() {
    super({ key: "pause" });
  }

  init(data: { previousScene: string }): void {
    this.previousSceneKey = data.previousScene ?? "stage";
  }

  create(): void {
    const { width, height } = this.cameras.main;

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6).setDepth(1000);

    this.add.text(width / 2, height / 2 - 60, "PAUSED", {
      font: "48px monospace",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 6,
    }).setOrigin(0.5).setDepth(1001);

    this.add.text(width / 2, height / 2 + 10, "Press ESC to resume", {
      font: "20px monospace",
      color: "#ffffff",
    }).setOrigin(0.5).setDepth(1001);

    this.add.text(width / 2, height / 2 + 50, "Press S for Settings", {
      font: "20px monospace",
      color: "#ffffff",
    }).setOrigin(0.5).setDepth(1001);

    this.input.keyboard!.on("keydown-ESC", () => {
      this.scene.resume(this.previousSceneKey);
      this.scene.stop();
    });

    this.input.keyboard!.on("keydown-S", () => {
      this.scene.launch("settings", { previousScene: this.previousSceneKey });
    });
  }
}