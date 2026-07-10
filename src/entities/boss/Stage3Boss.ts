// src/entities/boss/Stage3Boss.ts
import Phaser from "phaser";
import { Boss, BossConfig } from "./Boss";

export class Stage3Boss extends Boss {
  private attackTimer = 0;
  private readonly attackCooldown = 1500;
  private isGrounded = true;
  private moveDirection = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const config: BossConfig = {
      id: "stage3-boss",
      maxHealth: 180,
      scoreValue: 5500,
      phaseThresholds: [0.5, 0.25],
    };

    const texture = Stage3Boss.createPlaceholderTexture(scene, "stage3-boss");
    super(scene, x, y, texture, config);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(140, 500);
    body.setSize(40, 40);
    body.setOffset(0, 0);
  }

  private static createPlaceholderTexture(scene: Phaser.Scene, key: string): string {
    if (scene.textures.exists(key)) return key;
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x4488aa, 1);
    graphics.fillRect(4, 10, 32, 30);
    graphics.fillStyle(0x66aacc, 1);
    graphics.fillRect(8, 0, 24, 14);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(12, 4, 6, 6);
    graphics.fillRect(22, 4, 6, 6);
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(14, 6, 3, 3);
    graphics.fillRect(24, 6, 3, 3);
    graphics.generateTexture(key, 40, 40);
    graphics.destroy();
    return key;
  }

  update(_time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.isGrounded = body.blocked.down;
    this.updateMovement(delta);
    this.updateAttack(delta);
  }

  private updateMovement(_delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body.blocked.left) this.moveDirection = 1;
    if (body.blocked.right) this.moveDirection = -1;
    const phase = this.getPhase();
    const speed = 100 + phase * 30;
    body.setVelocityX(this.moveDirection * speed);
  }

  private updateAttack(delta: number): void {
    this.attackTimer -= delta;
    if (this.attackTimer > 0) return;
    const phase = this.getPhase();
    const cooldown = Math.max(800, this.attackCooldown - phase * 200);
    this.attackTimer = cooldown;
  }

  getIsGrounded(): boolean {
    return this.isGrounded;
  }
}