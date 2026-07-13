// src/entities/enemies/AlienEnemy.ts
import Phaser from "phaser";
import { Enemy } from "./Enemy";
import { IAiBehavior } from "../../ai/IAiBehavior";
import { IEntity } from "../../types/IEntity";
import { PHYSICS_CONFIG } from "../../config/PhysicsConfig";

export class AlienEnemy extends Enemy {
  private readonly attackCooldownMs = 1800;
  private attackCooldown = 0;
  private readonly floatAmplitude = 32;
  private readonly floatFrequency = 0.002;
  private baseY = 0;
  private readonly attackRange = PHYSICS_CONFIG.enemy.attackRange;

  constructor(scene: Phaser.Scene, x: number, y: number, behavior: IAiBehavior) {
    super(scene, x, y, "alien_enemy", 3, 120, behavior);
    this.baseY = y;
  }

  getAttackCooldownMs(): number {
    return this.attackCooldownMs;
  }

  canAttack(): boolean {
    return this.attackCooldown <= 0;
  }

  resetAttackCooldown(): void {
    this.attackCooldown = this.attackCooldownMs;
  }

  getBaseY(): number {
    return this.baseY;
  }

  getFloatAmplitude(): number {
    return this.floatAmplitude;
  }

  getFloatFrequency(): number {
    return this.floatFrequency;
  }

  update(_time: number, delta: number, target: IEntity | null = null): void {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }
    if (Number.isFinite(_time)) {
      const offset = Math.sin(_time * this.floatFrequency) * this.floatAmplitude;
      this.y = this.baseY + offset;
    }

    // NEW — fire at the player when in range
    if (target && this.canAttack()) {
      const targetSprite = target as unknown as Phaser.Physics.Arcade.Sprite;
      if (Math.abs(targetSprite.x - this.x) <= this.attackRange) {
        this.fireAt(target);
        this.resetAttackCooldown();
      }
    }

    super.update(_time, delta, target);
  }
}