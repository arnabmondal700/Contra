// src/entities/boss/Stage2Boss.ts
import Phaser from "phaser";
import { Boss, BossConfig } from "./Boss";

export class Stage2Boss extends Boss {
  private attackTimer = 0;
  private readonly attackCooldown = 1000;
  private jumpTimer = 0;
  private readonly jumpCooldown = 2500;
  private isGrounded = true;
  private moveDirection = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const config: BossConfig = {
      id: "stage2-boss",
      maxHealth: 250,
      scoreValue: 6000,
      phaseThresholds: [0.6, 0.3],
    };

    const texture = Stage2Boss.createPlaceholderTexture(scene, "stage2-boss");
    super(scene, x, y, texture, config);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(120, 400);
    body.setSize(56, 48);
    body.setOffset(0, 0);
  }

  private static createPlaceholderTexture(scene: Phaser.Scene, key: string): string {
    if (scene.textures.exists(key)) return key;
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x888888, 1);
    graphics.fillRect(4, 12, 48, 36);
    graphics.fillStyle(0xaaaaaa, 1);
    graphics.fillRect(8, 0, 40, 16);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(14, 4, 8, 6);
    graphics.fillRect(34, 4, 8, 6);
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(17, 6, 4, 3);
    graphics.fillRect(37, 6, 4, 3);
    graphics.generateTexture(key, 56, 48);
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
    const speed = 80 + phase * 20;
    body.setVelocityX(this.moveDirection * speed);
  }

  private updateAttack(delta: number): void {
    this.attackTimer -= delta;
    if (this.attackTimer > 0) return;
    const phase = this.getPhase();
    const cooldown = Math.max(500, this.attackCooldown - phase * 150);
    this.attackTimer = cooldown;
  }

  private updateJump(delta: number): void {
    this.jumpTimer -= delta;
    if (this.jumpTimer > 0) return;
    const phase = this.getPhase();
    const cooldown = Math.max(1500, this.jumpCooldown - phase * 300);
    this.jumpTimer = cooldown;
    if (this.isGrounded) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocityY(-250);
      this.isGrounded = false;
    }
  }

  getIsGrounded(): boolean {
    return this.isGrounded;
  }
}