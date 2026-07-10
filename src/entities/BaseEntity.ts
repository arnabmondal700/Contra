// src/entities/BaseEntity.ts
import Phaser from "phaser";
import { IEntity } from "../types/IEntity";
import { EventBus } from "../core/EventBus";

export abstract class BaseEntity extends Phaser.Physics.Arcade.Sprite implements IEntity {
  protected health: number;
  protected readonly maxHealth: number;
  protected isDead = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    maxHealth: number
  ) {
    super(scene, x, y, texture);
    this.maxHealth = maxHealth;
    this.health = maxHealth;
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  update(_time: number, _delta: number): void {
    // Base implementation - can be overridden by subclasses
  }

  takeDamage(amount: number, source?: IEntity): void {
    if (this.isDead) return;
    this.health = Math.max(0, this.health - amount);
    EventBus.emit("ENTITY_DAMAGED", { entity: this, amount, source });
    if (this.health === 0) this.die();
  }

  isAlive(): boolean {
    return !this.isDead;
  }

  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  protected die(): void {
    this.isDead = true;
    EventBus.emit("ENTITY_DIED", { entity: this });
  }

  destroy(): void {
    super.destroy();
  }
}