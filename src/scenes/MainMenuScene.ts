// scenes/MainMenuScene.ts
import Phaser from "phaser";
import { SaveManager } from "../managers/SaveManager";
import { getAllStageIds, getStageConfig } from "../data/StageData";

export class MainMenuScene extends Phaser.Scene {
  private selectedOption = 0;
  private selectedStage = 0;
  private menuOptions = [
    { text: "1 PLAYER", playerCount: 1 },
    { text: "2 PLAYERS", playerCount: 2 },
    { text: "STAGE SELECT", playerCount: -1 },
    { text: "OPTIONS", playerCount: 0 },
  ];
  private optionTexts: Phaser.GameObjects.Text[] = [];
  private stageTexts: Phaser.GameObjects.Text[] = [];
  private showStageSelect = false;

  constructor() {
    super({ key: "mainmenu" });
  }

  create(): void {
    const { width, height } = this.cameras.main;
    this.showStageSelect = false;

    // Clear previous texts
    this.optionTexts = [];
    this.stageTexts = [];

    // Title
    this.add
      .text(width / 2, height / 4, "CONTRA CLONE", {
        font: "48px monospace",
        color: "#ff4444",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(width / 2, height / 4 + 60, "A Phaser 3 Tribute", {
        font: "16px monospace",
        color: "#aaaaaa",
      })
      .setOrigin(0.5);

    // Menu options
    const startY = height / 2;
    for (let i = 0; i < this.menuOptions.length; i++) {
      const option = this.menuOptions[i];
      const text = this.add
        .text(width / 2, startY + i * 50, option.text, {
          font: "24px monospace",
          color: i === 0 ? "#ffff00" : "#ffffff",
        })
        .setOrigin(0.5);
      this.optionTexts.push(text);
    }

    // Controls info
    this.add
      .text(width / 2, height * 0.85, "UP/DOWN: Select  |  LEFT/RIGHT: Change Stage  |  ENTER/SPACE: Confirm", {
        font: "12px monospace",
        color: "#666666",
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.9, "P1: Arrows + Z/X  |  P2: WASD + Tab/Shift", {
        font: "10px monospace",
        color: "#555555",
      })
      .setOrigin(0.5);

    // Stage indicator
    const saveData = SaveManager.getInstance().load();
    const unlockedStages = saveData.unlockedStages;
    this.selectedStage = unlockedStages.includes("stage1") ? 0 : unlockedStages.length - 1;

    // Stage preview text
    this.updateStagePreview();

    // Input handlers
    this.input.keyboard!.on("keydown-UP", () => this.navigateMenu(-1));
    this.input.keyboard!.on("keydown-DOWN", () => this.navigateMenu(1));
    this.input.keyboard!.on("keydown-LEFT", () => {
      if (this.optionTexts[this.selectedOption]?.text === "STAGE SELECT") {
        this.selectedStage = Math.max(0, this.selectedStage - 1);
        this.updateStagePreview();
      }
    });
    this.input.keyboard!.on("keydown-RIGHT", () => {
      if (this.optionTexts[this.selectedOption]?.text === "STAGE SELECT") {
        const allStages = getAllStageIds();
        this.selectedStage = Math.min(allStages.length - 1, this.selectedStage + 1);
        this.updateStagePreview();
      }
    });
    this.input.keyboard!.on("keydown-ENTER", () => this.selectOption());
    this.input.keyboard!.on("keydown-SPACE", () => this.selectOption());
  }

  private navigateMenu(direction: number): void {
    this.optionTexts[this.selectedOption].setColor("#ffffff");
    this.selectedOption = (this.selectedOption + direction + this.menuOptions.length) % this.menuOptions.length;
    this.optionTexts[this.selectedOption].setColor("#ffff00");
    this.updateStagePreview();
  }

  private updateStagePreview(): void {
    // Remove old stage texts
    for (const text of this.stageTexts) {
      text.destroy();
    }
    this.stageTexts = [];

    const { width, height } = this.cameras.main;
    const allStages = getAllStageIds();
    const stageIds = this.getUnlockedStages();
    const selectedStageId = allStages[this.selectedStage] ?? "stage1";
    const config = getStageConfig(selectedStageId);

    if (config) {
      const isUnlocked = stageIds.includes(config.id);
      const stageInfo = this.add
        .text(width / 2, height * 0.75, `${config.id.toUpperCase()} - ${config.name}${isUnlocked ? "" : " [LOCKED]"}`, {
          font: "14px monospace",
          color: isUnlocked ? "#00ff00" : "#666666",
        })
        .setOrigin(0.5);
      this.stageTexts.push(stageInfo);
    }
  }

  private getUnlockedStages(): string[] {
    const saveData = SaveManager.getInstance().load();
    return saveData.unlockedStages;
  }

  private selectOption(): void {
    const option = this.menuOptions[this.selectedOption];
    if (option.playerCount > 0) {
      const allStages = getAllStageIds();
      const selectedStageId = allStages[this.selectedStage] ?? "stage1";
      const stageIds = this.getUnlockedStages();

      if (stageIds.includes(selectedStageId)) {
        this.scene.start("stage", { stageId: selectedStageId, playerCount: option.playerCount });
      }
    } else if (option.text === "STAGE SELECT") {
      // Toggle stage select mode
      this.showStageSelect = !this.showStageSelect;
      this.optionTexts[this.selectedOption].setColor(this.showStageSelect ? "#00ff00" : "#ffff00");
    } else if (option.text === "OPTIONS") {
      this.scene.start("options");
    }
  }
}