// scenes/VictoryScene.ts
import Phaser from "phaser";
import { SaveManager } from "../managers/SaveManager";
import { getNextStageId, getStageConfig } from "../data/StageData";

export class VictoryScene extends Phaser.Scene {
  private score = 0;
  private stageId = "stage1";
  private nextStageId: string | null = null;

  constructor() {
    super({ key: "victory" });
  }

  init(data: { score: number; stageId: string }): void {
    this.score = data.score;
    this.stageId = data.stageId;
    this.nextStageId = getNextStageId(data.stageId);
    console.log(`[VictoryScene] Stage ${this.stageId} cleared with score ${this.score}`);
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Save high score
    const saveManager = SaveManager.getInstance();
    const currentSave = saveManager.load();
    if (this.score > currentSave.highScore) {
      saveManager.save({ highScore: this.score });
    }

    // Unlock next stage
    if (this.nextStageId) {
      if (!currentSave.unlockedStages.includes(this.nextStageId)) {
        currentSave.unlockedStages.push(this.nextStageId);
        saveManager.save({ unlockedStages: currentSave.unlockedStages });
      }
    }

    const stageConfig = getStageConfig(this.stageId);

    this.add
      .text(width / 2, height / 4, "STAGE CLEAR!", {
        font: "40px monospace",
        color: "#00ff00",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 40, `Stage: ${stageConfig?.name ?? this.stageId}`, {
        font: "20px monospace",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2, `Score: ${this.score}`, {
        font: "24px monospace",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    if (this.nextStageId) {
      const nextConfig = getStageConfig(this.nextStageId);
      this.add
        .text(width / 2, height / 2 + 40, `Next: ${nextConfig?.name ?? this.nextStageId}`, {
          font: "16px monospace",
          color: "#aaaaaa",
        })
        .setOrigin(0.5);

      this.add
        .text(width / 2, height / 2 + 80, "Press ENTER to continue to next stage\nPress ESC for menu", {
          font: "14px monospace",
          color: "#ffffff",
          align: "center",
        })
        .setOrigin(0.5);

      this.input.keyboard!.once("keydown-ENTER", () => {
        this.scene.start("stage", { stageId: this.nextStageId, playerCount: 1 });
      });
    } else {
      this.add
        .text(width / 2, height / 2 + 40, "ALL STAGES COMPLETE!", {
          font: "20px monospace",
          color: "#ff4444",
        })
        .setOrigin(0.5);

      this.add
        .text(width / 2, height / 2 + 80, "Press ENTER to return to menu", {
          font: "14px monospace",
          color: "#ffffff",
        })
        .setOrigin(0.5);

      this.input.keyboard!.once("keydown-ENTER", () => {
        this.scene.start("mainmenu");
      });
    }

    this.input.keyboard!.once("keydown-ESC", () => {
      this.scene.start("mainmenu");
    });
  }

  update(_time: number, _delta: number): void {
    // Victory scene is static
  }
}