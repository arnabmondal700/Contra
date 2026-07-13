// src/entities/enemies/SoldierEnemy.ts
import Phaser from "phaser";
import { Enemy } from "./Enemy";
import { IAiBehavior } from "../../ai/IAiBehavior";
import { IEntity } from "../../types/IEntity";

export class SoldierEnemy extends Enemy {
  private patrolMinX: number;
  private patrolMaxX: number;
  private alertRange = 250;
  private attackRange = 180;
  private attackCooldown = 0;
  private readonly attackCooldownMs = 1200;

  constructor(scene: Phaser.Scene, x: number, y: number, behavior: IAiBehavior) {
    super(scene, x, y, "soldier_enemy", 3, 100, behavior);
    
    this.patrolMinX = x - 120;
    this.patrolMaxX = x + 120;
    
    this.setupBody();
  }

  private setupBody(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(16, 32);
    body.setOffset(0, 0);
    body.setCollideWorldBounds(true);
  }

  getPatrolMinX(): number {
    return this.patrolMinX;
  }

  getPatrolMaxX(): number {
    return this.patrolMaxX;
  }

  getAlertRange(): number {
    return this.alertRange;
  }

  getAttackRange(): number {
    return this.attackRange;
  }

  canAttack(): boolean {
    return this.attackCooldown <= 0;
  }

  resetAttackCooldown(): void {
    this.attackCooldown = this.attackCooldownMs;
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