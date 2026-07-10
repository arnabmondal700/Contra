// scenes/HudScene.ts
import Phaser from "phaser";
import { EventBus } from "../core/EventBus";

export class HudScene extends Phaser.Scene {
  private score = 0;
  private playerCount = 1;
  private bossHealth = 0;
  private bossMaxHealth = 1;
  private scoreText!: Phaser.GameObjects.Text;
  private livesTexts: Map<number, Phaser.GameObjects.Text> = new Map();
  private bossHealthBarBg!: Phaser.GameObjects.Graphics;
  private bossHealthBar!: Phaser.GameObjects.Graphics;
  private bossHealthText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "hud" });
  }

  init(data: { playerCount?: number }): void {
    this.playerCount = data.playerCount ?? 1;
  }

  create(): void {
    const { width } = this.cameras.main;

    this.scoreText = this.add
      .text(16, 16, "SCORE: 000000", { font: "16px monospace", color: "#ffffff" })
      .setScrollFactor(0)
      .setDepth(999);

    this.livesTexts.clear();
    for (let playerId = 1; playerId <= this.playerCount; playerId++) {
      const text = this.add
        .text(width - 16, 16 + (playerId - 1) * 24, `P${playerId} LIVES: 3`, { font: "14px monospace", color: "#ffffff" })
        .setOrigin(1, 0)
        .setScrollFactor(0)
        .setDepth(999);
      this.livesTexts.set(playerId, text);
    }

    this.bossHealthBarBg = this.add.graphics();
    this.bossHealthBarBg.setScrollFactor(0);
    this.bossHealthBarBg.setDepth(998);

    this.bossHealthBar = this.add.graphics();
    this.bossHealthBar.setScrollFactor(0);
    this.bossHealthBar.setDepth(999);

    this.bossHealthText = this.add
      .text(0, 0, "", { font: "14px monospace", color: "#ffffff" })
      .setScrollFactor(0)
      .setOrigin(0.5)
      .setDepth(999)
      .setVisible(false);

    EventBus.on("ENEMY_KILLED", (payload) => {
      this.score += payload.scoreValue;
      this.updateScore();
    });

    EventBus.on("PLAYER_DIED", () => {
      // handled via LIVES_CHANGED
    });

    EventBus.on("PLAYER_RESPAWN", () => {
      // handled via LIVES_CHANGED
    });

    EventBus.on("LIVES_CHANGED", (payload) => {
      this.updateLivesText(payload.playerId, payload.lives);
    });

    EventBus.on("ENTITY_DAMAGED", (payload) => {
      const entity = payload.entity as {
        health?: number;
        maxHealth?: number;
      } | null;
      if (entity && typeof entity.health === "number" && typeof entity.maxHealth === "number") {
        this.bossHealth = entity.health;
        this.bossMaxHealth = entity.maxHealth;
        this.updateBossHealthBar();
      }
    });
  }

  private updateScore(): void {
    this.scoreText.setText(`SCORE: ${this.score.toString().padStart(6, "0")}`);
  }

  private updateLivesText(playerId: number, lives: number): void {
    const text = this.livesTexts.get(playerId);
    if (text) {
      text.setText(`P${playerId} LIVES: ${lives}`);
    }
  }

  private updateBossHealthBar(): void {
    const { width, height } = this.cameras.main;
    const barWidth = 300;
    const barHeight = 12;
    const x = (width - barWidth) / 2;
    const y = height - 24;

    this.bossHealthBarBg.clear();
    this.bossHealthBarBg.fillStyle(0x330000, 1);
    this.bossHealthBarBg.fillRect(x, y, barWidth, barHeight);

    this.bossHealthBar.clear();
    if (this.bossMaxHealth > 0) {
      const pct = Phaser.Math.Clamp(this.bossHealth / this.bossMaxHealth, 0, 1);
      this.bossHealthBar.fillStyle(0xff2222, 1);
      this.bossHealthBar.fillRect(x, y, barWidth * pct, barHeight);
    }

    this.bossHealthText.setPosition(width / 2, y - 10);
    this.bossHealthText.setText(`BOSS: ${this.bossHealth} / ${this.bossMaxHealth}`);
  }

  showBossHealthBar(maxHealth: number): void {
    this.bossMaxHealth = maxHealth;
    this.bossHealth = maxHealth;
    this.bossHealthBar.setVisible(true);
    this.bossHealthText.setVisible(true);
    this.updateBossHealthBar();
  }

  hideBossHealthBar(): void {
    this.bossHealthBar.setVisible(false);
    this.bossHealthText.setVisible(false);
    this.bossHealthBarBg.clear();
  }
}