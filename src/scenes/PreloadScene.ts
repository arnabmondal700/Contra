// scenes/PreloadScene.ts
import Phaser from "phaser";
import { createPlayerAnimations, generatePlaceholderPlayerSpritesheet } from "../config/PlayerAnimations";

export class PreloadScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics;
  private progressBox!: Phaser.GameObjects.Graphics;
  private loadingText!: Phaser.GameObjects.Text;
  private percentText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "preload" });
  }

  preload(): void {
    this.createLoadingUI();

    this.load.on("progress", (value: number) => {
      this.progressBar.clear();
      this.progressBar.fillStyle(0xffffff, 1);
      this.progressBar.fillRect(
        this.cameras.main.width / 2 - 160,
        this.cameras.main.height / 2 - 15,
        320 * value,
        30
      );
      this.percentText.setText(`${Math.floor(value * 100)}%`);
    });

    this.load.on("complete", () => {
      this.progressBox.destroy();
      this.progressBar.destroy();
      this.loadingText.destroy();
      this.percentText.destroy();
    });

    // Load placeholder assets here in later phases.
    // For Phase 0 scaffolding, we only need to transition.
  }

  create(): void {
    // Generate the player spritesheet and create animations once, before any Player is created.
    generatePlaceholderPlayerSpritesheet(this, "player");
    createPlayerAnimations(this, "player");

    console.log("[PreloadScene] Assets loaded. Transitioning to MainMenuScene...");
    this.scene.start("mainmenu");
  }

  private createLoadingUI(): void {
    const { width, height } = this.cameras.main;

    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 0.8);
    this.progressBox.fillRect(width / 2 - 170, height / 2 - 25, 340, 50);

    this.progressBar = this.add.graphics();

    this.loadingText = this.add.text(width / 2, height / 2 - 60, "Loading...", {
      font: "20px monospace",
      color: "#ffffff",
    });
    this.loadingText.setOrigin(0.5);

    this.percentText = this.add.text(width / 2, height / 2, "0%", {
      font: "16px monospace",
      color: "#ffffff",
    });
    this.percentText.setOrigin(0.5);
  }
}