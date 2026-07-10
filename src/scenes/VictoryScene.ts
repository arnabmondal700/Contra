// scenes/VictoryScene.ts
import Phaser from "phaser";
import { SaveManager } from "../managers/SaveManager";

export class VictoryScene extends Phaser.Scene {
  private score = 0;
  private stageId = "stage1";

  constructor() {
    super({ key: "victory" });
  }

  init(data: { score: number; stageId: string }): void {
    this.score = data.score;
    this.stageId = data.stageId;
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

    // Unlock next stage (simple progression: stage1 -> stage2)
    const nextStage = `stage${Number(this.stageId.replace("stage", "")) + 1}`;
    if (!currentSave.unlockedStages.includes(nextStage)) {
      currentSave.unlockedStages.push(nextStage);
      saveManager.save({ unlockedStages: currentSave.unlockedStages });
    }

    this.add
      .text(width / 2, height / 4, "STAGE CLEAR!", {
        font: "40px monospace",
        color: "#00ff00",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 20, `Score: ${this.score}`, {
        font: "24px monospace",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 40, "Press ENTER to continue", {
        font: "16px monospace",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.input.keyboard!.once("keydown-ENTER", () => {
      this.scene.start("mainmenu");
    });

    this.input.keyboard!.once("keydown-ESC", () => {
      this.scene.start("mainmenu");
    });
  }

  update(_time: number, _delta: number): void {
    // Victory scene is static
  }
}