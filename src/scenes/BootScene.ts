// scenes/BootScene.ts
import Phaser from "phaser";
import { ServiceLocator } from "../core/ServiceLocator";
import { SaveManager } from "../managers/SaveManager";
import { AudioManager } from "../managers/AudioManager";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "boot" });
  }

  preload(): void {
    // Load minimal boot assets if needed
  }

  create(): void {
    console.log("[BootScene] Initializing services...");

    // Register core services
    ServiceLocator.register("saveManager", SaveManager.getInstance());
    ServiceLocator.register("audioManager", AudioManager.getInstance());

    console.log("[BootScene] Services registered. Transitioning to PreloadScene...");
    this.scene.start("preload");
  }
}
