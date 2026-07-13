// src/entities/enemies/TurretEnemy.ts
import Phaser from "phaser";
import { Enemy } from "./Enemy";
import { IAiBehavior } from "../../ai/IAiBehavior";
import { IEntity } from "../../types/IEntity";

export class TurretEnemy extends Enemy {
  private readonly attackCooldownMs = 1500;
  private attackCooldown = 0;
  private readonly attackRange = 300;
  private readonly rotationSpeed = 2;

  constructor(scene: Phaser.Scene, x: number, y: number, behavior: IAiBehavior) {
    super(scene, x, y, "turret_enemy", 4, 200, behavior);
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

  getAttackRange(): number {
    return this.attackRange;
  }

  getRotationSpeed(): number {
    return this.rotationSpeed;
  }

  update(_time: number, delta: number, target: IEntity | null = null): void {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
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