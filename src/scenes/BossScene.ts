// scenes/BossScene.ts
import Phaser from "phaser";

export class BossScene extends Phaser.Scene {
  constructor() {
    super({ key: "boss" });
  }

  init(data: { stageId: string; bossId: string; playerState: unknown }): void {
    console.log(`[BossScene] Starting boss ${data.bossId} for ${data.stageId}`);
  }

  create(): void {
    const { width, height } = this.cameras.main;
    this.add
      .text(width / 2, height / 2, "BOSS FIGHT\n(Coming Soon)", {
        font: "24px monospace",
        color: "#ff4444",
        align: "center",
      })
      .setOrigin(0.5);

    this.input.keyboard!.once("keydown-ESC", () => {
      this.scene.start("mainmenu");
    });
  }

  update(_time: number, _delta: number): void {
    // Boss logic will go here
  }
}
