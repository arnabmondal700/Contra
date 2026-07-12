// src/entities/enemies/SniperEnemy.ts
import Phaser from "phaser";
import { Enemy } from "./Enemy";
import { IAiBehavior } from "../../ai/IAiBehavior";
import { IEntity } from "../../types/IEntity";

export class SniperEnemy extends Enemy {
  private readonly attackCooldownMs = 2000;
  private attackCooldown = 0;
  private aimDuration = 0;
  private readonly aimDelayMs = 600;
  private isAiming = false;

  constructor(scene: Phaser.Scene, x: number, y: number, behavior: IAiBehavior) {
    super(scene, x, y, "sniper_enemy", 2, 150, behavior);
  }

  getAttackCooldownMs(): number {
    return this.attackCooldownMs;
  }

  canAttack(): boolean {
    return this.attackCooldown <= 0 && !this.isAiming;
  }

  resetAttackCooldown(): void {
    this.attackCooldown = this.attackCooldownMs;
  }

  startAiming(): void {
    this.isAiming = true;
    this.aimDuration = this.aimDelayMs;
  }

  isAimComplete(): boolean {
    return this.isAiming && this.aimDuration <= 0;
  }

  update(_time: number, delta: number, target: IEntity | null = null): void {
    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
    }
    if (this.isAiming) {
      this.aimDuration -= delta;
      if (this.aimDuration <= 0) {
        this.isAiming = false;
      }
    }
    super.update(_time, delta, target);
  }
}