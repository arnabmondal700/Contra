// src/entities/boss/Stage5Boss.ts
import Phaser from "phaser";
import { Boss, BossConfig } from "./Boss";

export class Stage5Boss extends Boss {
  private attackTimer = 0;
  private readonly attackCooldown = 1200;
  private isGrounded = true;
  private moveDirection = 1;
  private floatOffset = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const config: BossConfig = {
      id: "stage5-boss",
      maxHealth: 220,
      scoreValue: 6500,
      phaseThresholds: [0.6, 0.3],
    };

    const texture = Stage5Boss.createPlaceholderTexture(scene, "stage5-boss");
    super(scene, x, y, texture, config);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(130, 300);
    body.setSize(48, 48);
    body.setOffset(0, 0);
  }

  private static createPlaceholderTexture(scene: Phaser.Scene, key: string): string {
    if (scene.textures.exists(key)) return key;
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0xff00ff, 1);
    graphics.fillRect(4, 12, 40, 36);
    graphics.fillStyle(0xff66ff, 1);
    graphics.fillRect(8, 0, 32, 16);
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(12, 4, 8, 8);
    graphics.fillRect(28, 4, 8, 8);
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(15, 7, 4, 4);
    graphics.fillRect(31, 7, 4, 4);
    graphics.generateTexture(key, 48, 48);
    graphics.destroy();
    return key;
  }

  update(_time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.isGrounded = body.blocked.down;
    this.floatOffset = Math.sin(_time * 0.003) * 20;
    this.y += this.floatOffset * (delta / 1000) * 2;
    this.updateMovement(delta);
    this.updateAttack(delta);
  }

  private updateMovement(_delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body.blocked.left) this.moveDirection = 1;
    if (body.blocked.right) this.moveDirection = -1;
    const phase = this.getPhase();
    const speed = 90 + phase * 25;
    body.setVelocityX(this.moveDirection * speed);
  }

  private updateAttack(delta: number): void {
    this.attackTimer -= delta;
    if (this.attackTimer > 0) return;
    const phase = this.getPhase();
    const cooldown = Math.max(700, this.attackCooldown - phase * 150);
    this.attackTimer = cooldown;
  }

  getIsGrounded(): boolean {
    return this.isGrounded;
  }
}