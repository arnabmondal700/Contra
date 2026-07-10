// src/entities/boss/Stage8Boss.ts
import Phaser from "phaser";
import { Boss, BossConfig } from "./Boss";

export class Stage8Boss extends Boss {
  private attackTimer = 0;
  private readonly attackCooldown = 800;
  private jumpTimer = 0;
  private readonly jumpCooldown = 2000;
  private isGrounded = true;
  private moveDirection = 1;
  private enrageTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const config: BossConfig = {
      id: "stage8-boss",
      maxHealth: 500,
      scoreValue: 10000,
      phaseThresholds: [0.7, 0.4, 0.2],
    };

    const texture = Stage8Boss.createPlaceholderTexture(scene, "stage8-boss");
    super(scene, x, y, texture, config);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(160, 500);
    body.setSize(72, 64);
    body.setOffset(0, 0);
  }

  private static createPlaceholderTexture(scene: Phaser.Scene, key: string): string {
    if (scene.textures.exists(key)) return key;
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(4, 20, 64, 44);
    graphics.fillStyle(0xff4444, 1);
    graphics.fillRect(8, 0, 56, 24);
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(14, 6, 12, 10);
    graphics.fillRect(46, 6, 12, 10);
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(19, 10, 4, 4);
    graphics.fillRect(51, 10, 4, 4);
    graphics.fillStyle(0xff8800, 1);
    graphics.fillRect(28, 28, 16, 16);
    graphics.generateTexture(key, 72, 64);
    graphics.destroy();
    return key;
  }

  update(_time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.isGrounded = body.blocked.down;
    this.enrageTimer += delta;
    this.updateMovement(delta);
    this.updateAttack(delta);
    this.updateJump(delta);
  }

  private updateMovement(_delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body.blocked.left) this.moveDirection = 1;
    if (body.blocked.right) this.moveDirection = -1;
    const phase = this.getPhase();
    const speed = 100 + phase * 40;
    body.setVelocityX(this.moveDirection * speed);
  }

  private updateAttack(delta: number): void {
    this.attackTimer -= delta;
    if (this.attackTimer > 0) return;
    const phase = this.getPhase();
    const cooldown = Math.max(300, this.attackCooldown - phase * 150);
    this.attackTimer = cooldown;
  }

  private updateJump(delta: number): void {
    this.jumpTimer -= delta;
    if (this.jumpTimer > 0) return;
    const phase = this.getPhase();
    const cooldown = Math.max(1000, this.jumpCooldown - phase * 300);
    this.jumpTimer = cooldown;
    if (this.isGrounded) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocityY(-350);
      this.isGrounded = false;
    }
  }

  getIsGrounded(): boolean {
    return this.isGrounded;
  }
}