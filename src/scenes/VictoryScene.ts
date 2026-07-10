// scenes/VictoryScene.ts
import Phaser from "phaser";

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: "victory" });
  }

  init(data: { score: number; stageId: string }): void {
    console.log(`[VictoryScene] Stage ${data.stageId} cleared with score ${data.score}`);
  }

  create(): void {
    const { width, height } = this.cameras.main;

    this.add
      .text(width / 2, height / 3, "STAGE CLEAR!", {
        font: "40px monospace",
        color: "#00ff00",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2, "Press ENTER to continue", {
        font: "16px monospace",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.input.keyboard!.once("keydown-ENTER", () => {
      this.scene.start("mainmenu");
    });
  }
}
