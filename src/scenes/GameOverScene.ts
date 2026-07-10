// scenes/GameOverScene.ts
import Phaser from "phaser";

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "gameover" });
  }

  init(data: { score: number; stageId: string; checkpoint?: unknown }): void {
    console.log(`[GameOverScene] Game over on ${data.stageId} with score ${data.score}`);
  }

  create(): void {
    const { width, height } = this.cameras.main;

    this.add
      .text(width / 2, height / 3, "GAME OVER", {
        font: "48px monospace",
        color: "#ff0000",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 30, "Press ENTER to retry\nPress ESC for menu", {
        font: "16px monospace",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    this.input.keyboard!.once("keydown-ENTER", () => {
      this.scene.start("stage", { stageId: "stage1", playerCount: 1 });
    });

    this.input.keyboard!.once("keydown-ESC", () => {
      this.scene.start("mainmenu");
    });
  }
}
