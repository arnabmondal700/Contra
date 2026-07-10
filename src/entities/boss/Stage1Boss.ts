// entities/boss/Stage1Boss.ts
import Phaser from "phaser";
import { Boss, BossConfig } from "./Boss";

export class Stage1Boss extends Boss {
  private attackTimer = 0;
  private readonly attackCooldown = 1200;
  private jumpTimer = 0;
  private readonly jumpCooldown = 3000;
  private isGrounded = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const config: BossConfig = {
      id: "stage1-boss",
      maxHealth: 200,
      scoreValue: 5000,
      phaseThresholds: [0.6, 0.3],
    };

    const texture = Stage1Boss.createPlaceholderTexture(scene, "stage1-boss");
    super(scene, x, y, texture, config);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(100, 400);
    body.setSize(48, 48);
    body.setOffset(0, 0);
  }

  private static createPlaceholderTexture(
    scene: Phaser.Scene,
    key: string
  ): string {
    if (scene.textures.exists(key)) return key;

    const graphics = scene.make.graphics({ x: 0, y: 0 });
    // Main body
    graphics.fillStyle(0xff2222, 1);
    graphics.fillRect(8, 12, 32, 24);
    // Head
    graphics.fillStyle(0xff6666, 1);
    graphics.fillRect(12, 0, 24, 14);
    // Eyes
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(16, 4, 6, 6);
    graphics.fillRect(26, 4, 6, 6);
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(19, 6, 3, 3);
    graphics.fillRect(29, 6, 3, 3);

    graphics.generateTexture(key, 48, 48);
    graphics.destroy();
    return key;
  }

  update(_time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.isGrounded = body.blocked.down;
    this.updateAttack(delta);
    this.updateJump(delta);
  }

  private updateAttack(delta: number): void {
    this.attackTimer -= delta;
    if (this.attackTimer > 0) return;

    const phase = this.getPhase();
    const cooldown = Math.max(600, this.attackCooldown - phase * 150);
    this.attackTimer = cooldown;

    // Attack behavior differs by phase
    if (phase >= 2) {
      // Phase 3: spread attack (emitted via EventBus for WeaponSystem or custom projectile spawner)
      // Keeping it simple by just emitting an event that StageScene or BossScene can listen to
    }
  }

  private updateJump(delta: number): void {
    this.jumpTimer -= delta;
    if (this.jumpTimer > 0) return;

    const phase = this.getPhase();
    const cooldown = Math.max(2000, this.jumpCooldown - phase * 400);
    this.jumpTimer = cooldown;

    if (this.isGrounded) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocityY(-220);
      this.isGrounded = false;
    }
  }

  getIsGrounded(): boolean {
    return this.isGrounded;
  }
}