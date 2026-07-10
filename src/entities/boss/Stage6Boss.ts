// src/entities/boss/Stage6Boss.ts
import Phaser from "phaser";
import { Boss, BossConfig } from "./Boss";

export class Stage6Boss extends Boss {
  private attackTimer = 0;
  private readonly attackCooldown = 900;
  private jumpTimer = 0;
  private readonly jumpCooldown = 3000;
  private isGrounded = true;
  private moveDirection = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const config: BossConfig = {
      id: "stage6-boss",
      maxHealth: 350,
      scoreValue: 8000,
      phaseThresholds: [0.7, 0.4],
    };

    const texture = Stage6Boss.createPlaceholderTexture(scene, "stage6-boss");
    super(scene, x, y, texture, config);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(150, 450);
    body.setSize(52, 52);
    body.setOffset(0, 0);
  }

  private static createPlaceholderTexture(scene: Phaser.Scene, key: string): string {
    if (scene.textures.exists(key)) return key;
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x4444ff, 1);
    graphics.fillRect(4, 14, 44, 38);
    graphics.fillStyle(0x6666ff, 1);
    graphics.fillRect(8, 0, 36, 18);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(14, 4, 8, 8);
    graphics.fillRect(30, 4, 8, 8);
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(17, 7, 4, 4);
    graphics.fillRect(33, 7, 4, 4);
    graphics.generateTexture(key, 52, 52);
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
    const speed = 100 + phase * 30;
    body.setVelocityX(this.moveDirection * speed);
  }

  private updateAttack(delta: number): void {
    this.attackTimer -= delta;
    if (this.attackTimer > 0) return;
    const phase = this.getPhase();
    const cooldown = Math.max(400, this.attackCooldown - phase * 100);
    this.attackTimer = cooldown;
  }

  private updateJump(delta: number): void {
    this.jumpTimer -= delta;
    if (this.jumpTimer > 0) return;
    const phase = this.getPhase();
    const cooldown = Math.max(1800, this.jumpCooldown - phase * 400);
    this.jumpTimer = cooldown;
    if (this.isGrounded) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocityY(-300);
      this.isGrounded = false;
    }
  }

  getIsGrounded(): boolean {
    return this.isGrounded;
  }
}