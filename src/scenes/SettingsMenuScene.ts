// scenes/SettingsMenuScene.ts
import Phaser from "phaser";
import { AudioManager } from "../managers/AudioManager";
import { SaveManager } from "../managers/SaveManager";

export class SettingsMenuScene extends Phaser.Scene {
  private previousSceneKey = "";
  private selectedOption = 0;
  private optionTexts: Phaser.GameObjects.Text[] = [];
  private menuOptions = ["Music Volume", "SFX Volume", "Back"];
  private musicVolume = 0.8;
  private sfxVolume = 0.8;

  constructor() {
    super({ key: "settings" });
  }

  init(data: { previousScene: string }): void {
    this.previousSceneKey = data.previousScene ?? "stage";
  }

  create(): void {
    const { width, height } = this.cameras.main;
    const saved = SaveManager.getInstance().loadSettings();
    this.musicVolume = saved.musicVolume;
    this.sfxVolume = saved.sfxVolume;

    this.add.text(width / 2, height / 4, "SETTINGS", {
      font: "40px monospace",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
    }).setOrigin(0.5);

    const startY = height / 2;
    for (let i = 0; i < this.menuOptions.length; i++) {
      const text = this.add
        .text(width / 2, startY + i * 50, this.menuOptions[i], {
          font: "22px monospace",
          color: i === 0 ? "#ffff00" : "#ffffff",
        })
        .setOrigin(0.5);
      this.optionTexts.push(text);
    }

    this.input.keyboard!.on("keydown-UP", () => this.navigate(-1));
    this.input.keyboard!.on("keydown-DOWN", () => this.navigate(1));
    this.input.keyboard!.on("keydown-LEFT", () => this.adjust(-1));
    this.input.keyboard!.on("keydown-RIGHT", () => this.adjust(1));
    this.input.keyboard!.on("keydown-ENTER", () => this.confirm());
    this.input.keyboard!.on("keydown-SPACE", () => this.confirm());
  }

  private navigate(direction: number): void {
    this.optionTexts[this.selectedOption].setColor("#ffffff");
    this.selectedOption = (this.selectedOption + direction + this.menuOptions.length) % this.menuOptions.length;
    this.optionTexts[this.selectedOption].setColor("#ffff00");
  }

  private adjust(direction: number): void {
    const audio = AudioManager.getInstance();
    const step = 0.1;
    const option = this.menuOptions[this.selectedOption];
    if (option === "Music Volume") {
      this.musicVolume = Phaser.Math.Clamp(this.musicVolume + direction * step, 0, 1);
    } else if (option === "SFX Volume") {
      this.sfxVolume = Phaser.Math.Clamp(this.sfxVolume + direction * step, 0, 1);
    }
    audio.playSfx("click");
  }

  private confirm(): void {
    const option = this.menuOptions[this.selectedOption];
    if (option === "Back") {
      const saveManager = SaveManager.getInstance();
      saveManager.saveSettings({
        musicVolume: this.musicVolume,
        sfxVolume: this.sfxVolume,
      });
      this.scene.stop();
      if (this.previousSceneKey) {
        this.scene.resume(this.previousSceneKey);
      }
    }
  }
}