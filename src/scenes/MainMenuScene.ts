// scenes/MainMenuScene.ts
import Phaser from "phaser";

export class MainMenuScene extends Phaser.Scene {
  private selectedOption = 0;
  private menuOptions = [
    { text: "1 PLAYER", playerCount: 1 },
    { text: "2 PLAYERS", playerCount: 2 },
    { text: "OPTIONS", playerCount: 0 },
  ];
  private optionTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: "mainmenu" });
  }

  create(): void {
    const { width, height } = this.cameras.main;

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
      .text(width / 2, height * 0.85, "UP/DOWN: Select  |  ENTER/SPACE: Confirm", {
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

    // Input handlers
    this.input.keyboard!.on("keydown-UP", () => this.navigateMenu(-1));
    this.input.keyboard!.on("keydown-DOWN", () => this.navigateMenu(1));
    this.input.keyboard!.on("keydown-ENTER", () => this.selectOption());
    this.input.keyboard!.on("keydown-SPACE", () => this.selectOption());
  }

  private navigateMenu(direction: number): void {
    this.optionTexts[this.selectedOption].setColor("#ffffff");
    this.selectedOption = Phaser.Math.Wrap(this.selectedOption + direction, 0, this.menuOptions.length);
    this.optionTexts[this.selectedOption].setColor("#ffff00");
  }

  private selectOption(): void {
    const option = this.menuOptions[this.selectedOption];
    if (option.playerCount > 0) {
      this.scene.start("stage", { stageId: "stage1", playerCount: option.playerCount });
    } else if (option.text === "OPTIONS") {
      this.scene.start("options");
    }
  }
}
