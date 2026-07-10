// src/entities/boss/Stage4Boss.ts
import Phaser from "phaser";
import { Boss, BossConfig } from "./Boss";

export class Stage4Boss extends Boss {
  private attackTimer = 0;
  private readonly attackCooldown = 1800;
  private jumpTimer = 0;
  private readonly jumpCooldown = 2000;
  private isGrounded = true;
  private moveDirection = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const config: BossConfig = {
      id: "stage4-boss",
      maxHealth: 300,
      scoreValue: 7000,
      phaseThresholds: [0.65, 0.35],
    };

    const texture = Stage4Boss.createPlaceholderTexture(scene, "stage4-boss");
    super(scene, x, y, texture, config);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(90, 350);
    body.setSize(64, 56);
    body.setOffset(0, 0);
  }

  private static createPlaceholderTexture(scene: Phaser.Scene, key: string): string {
    if (scene.textures.exists(key)) return key;
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xff6600, 1);
    graphics.fillRect(4, 16, 56, 40);
    graphics.fillStyle(0xff8844, 1);
    graphics.fillRect(8, 0, 48, 20);
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(14, 6, 10, 8);
    graphics.fillRect(40, 6, 10, 8);
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(18, 9, 4, 4);
    graphics.fillRect(44, 9, 4, 4);
    graphics.generateTexture(key, 64, 56);
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
    const speed = 60 + phase * 15;
    body.setVelocityX(this.moveDirection * speed);
  }

  private updateAttack(delta: number): void {
    this.attackTimer -= delta;
    if (this.attackTimer > 0) return;
    const phase = this.getPhase();
    const cooldown = Math.max(1000, this.attackCooldown - phase * 250);
    this.attackTimer = cooldown;
  }

  private updateJump(delta: number): void {
    this.jumpTimer -= delta;
    if (this.jumpTimer > 0) return;
    const phase = this.getPhase();
    const cooldown = Math.max(1200, this.jumpCooldown - phase * 200);
    this.jumpTimer = cooldown;
    if (this.isGrounded) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocityY(-280);
      this.isGrounded = false;
    }
  }

  getIsGrounded(): boolean {
    return this.isGrounded;
  }
}