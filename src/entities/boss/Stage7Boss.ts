// src/entities/boss/Stage7Boss.ts
import Phaser from "phaser";
import { Boss, BossConfig } from "./Boss";

export class Stage7Boss extends Boss {
  private attackTimer = 0;
  private readonly attackCooldown = 1100;
  private jumpTimer = 0;
  private readonly jumpCooldown = 2200;
  private isGrounded = true;
  private moveDirection = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const config: BossConfig = {
      id: "stage7-boss",
      maxHealth: 400,
      scoreValue: 9000,
      phaseThresholds: [0.65, 0.35, 0.15],
    };

    const texture = Stage7Boss.createPlaceholderTexture(scene, "stage7-boss");
    super(scene, x, y, texture, config);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(110, 400);
    body.setSize(60, 56);
    body.setOffset(0, 0);
  }

  private static createPlaceholderTexture(scene: Phaser.Scene, key: string): string {
    if (scene.textures.exists(key)) return key;
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xcc8844, 1);
    graphics.fillRect(4, 16, 52, 40);
    graphics.fillStyle(0xeeaa66, 1);
    graphics.fillRect(8, 0, 44, 20);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(14, 6, 10, 8);
    graphics.fillRect(36, 6, 10, 8);
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(18, 9, 4, 4);
    graphics.fillRect(40, 9, 4, 4);
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(24, 24, 12, 12);
    graphics.generateTexture(key, 60, 56);
    graphics.destroy();
    return key;
  }

  update(_time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.isGrounded = body.blocked.down;
    this.updateMovement(delta);
    this.updateAttack(delta);
    this.updateJump(delta);
  }

  private updateMovement(_delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body.blocked.left) this.moveDirection = 1;
    if (body.blocked.right) this.moveDirection = -1;
    const phase = this.getPhase();
    const speed = 70 + phase * 20;
    body.setVelocityX(this.moveDirection * speed);
  }

  private updateAttack(delta: number): void {
    this.attackTimer -= delta;
    if (this.attackTimer > 0) return;
    const phase = this.getPhase();
    const cooldown = Math.max(600, this.attackCooldown - phase * 150);
    this.attackTimer = cooldown;
  }

  private updateJump(delta: number): void {
    this.jumpTimer -= delta;
    if (this.jumpTimer > 0) return;
    const phase = this.getPhase();
    const cooldown = Math.max(1400, this.jumpCooldown - phase * 250);
    this.jumpTimer = cooldown;
    if (this.isGrounded) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocityY(-260);
      this.isGrounded = false;
    }
  }

  getIsGrounded(): boolean {
    return this.isGrounded;
  }
}