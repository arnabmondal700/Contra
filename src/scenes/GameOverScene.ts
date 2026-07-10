// scenes/GameOverScene.ts
import Phaser from "phaser";

export class GameOverScene extends Phaser.Scene {
  private stageId = "stage1";
  private checkpoint: { x: number; y: number } | undefined;
  private playerCount = 1;

  constructor() {
    super({ key: "gameover" });
  }

  init(data: { stageId: string; playerCount?: number; checkpoint?: { x: number; y: number } }): void {
    this.stageId = data.stageId;
    this.playerCount = data.playerCount ?? 1;
    this.checkpoint = data.checkpoint;
    console.log(`[GameOverScene] Game over on ${this.stageId} with ${this.playerCount} player(s)`);
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
      if (this.checkpoint) {
        this.scene.start("stage", {
          stageId: this.stageId,
          playerCount: this.playerCount,
          checkpoint: this.checkpoint,
        });
      } else {
        this.scene.start("stage", { stageId: this.stageId, playerCount: this.playerCount });
      }
    });

    this.input.keyboard!.once("keydown-ESC", () => {
      this.scene.start("mainmenu");
    });
  }
}