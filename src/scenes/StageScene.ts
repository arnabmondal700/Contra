// scenes/StageScene.ts
import Phaser from "phaser";

export class StageScene extends Phaser.Scene {
  constructor() {
    super({ key: "stage" });
  }

  init(data: { stageId: string; playerCount: number; checkpoint?: { x: number; y: number } }): void {
    console.log(`[StageScene] Starting ${data.stageId} with ${data.playerCount} player(s)`);
  }

  create(): void {
    const { width, height } = this.cameras.main;
    this.add
      .text(width / 2, height / 2, "STAGE 1\n(Under Construction)", {
        font: "24px monospace",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    // Placeholder: press ESC to return to menu
    this.input.keyboard!.once("keydown-ESC", () => {
      this.scene.start("mainmenu");
    });
  }

  update(_time: number, _delta: number): void {
    // Gameplay loop will go here
  }
}
