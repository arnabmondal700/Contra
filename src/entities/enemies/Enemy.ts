// src/entities/enemies/Enemy.ts
import Phaser from "phaser";
import { BaseEntity } from "../BaseEntity";
import { IEntity } from "../../types/IEntity";
import { IAiBehavior } from "../../ai/IAiBehavior";
import { StateMachine } from "../../core/StateMachine";
import { EventBus } from "../../core/EventBus";

export class Enemy extends BaseEntity {
  protected behavior: IAiBehavior;
  protected fsm: StateMachine<Enemy>;
  protected scoreValue: number;
  protected facingRight = true;
  private isActive = false;
  private textureKey: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    maxHealth: number,
    scoreValue: number,
    behavior: IAiBehavior
  ) {
    super(scene, x, y, texture, maxHealth);
    
    this.textureKey = texture;
    this.behavior = behavior;
    this.scoreValue = scoreValue;
    
    // Enable physics
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    
    // Placeholder texture generation
    this.createPlaceholderTexture(texture);
    
    // State machine
    this.fsm = new StateMachine(this);
  }

  private createPlaceholderTexture(key: string): void {
    if (this.scene.textures.exists(key)) return;
    
    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    // Body (red for enemies)
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 16, 32);
    // Head
    graphics.fillStyle(0xffaaaa, 1);
    graphics.fillRect(2, -4, 12, 12);
    
    graphics.generateTexture(key, 24, 32);
    graphics.destroy();
  }

  activate(): void {
    this.isActive = true;
    this.setActive(true).setVisible(true);
  }

  deactivate(): void {
    this.isActive = false;
    this.setActive(false).setVisible(false);
  }

  isEnemyActive(): boolean {
    return this.isActive;
  }

  getScoreValue(): number {
    return this.scoreValue;
  }

  getFsm(): StateMachine<Enemy> {
    return this.fsm;
  }

  setFacingRight(right: boolean): void {
    this.facingRight = right;
    this.flipX = !right;
  }

  isFacingRight(): boolean {
    return this.facingRight;
  }

  protected die(): void {
    super.die();
    EventBus.emit("ENEMY_KILLED", {
      enemyId: this.textureKey,
      scoreValue: this.scoreValue,
      position: { x: this.x, y: this.y }
    });
    this.deactivate();
  }

  update(_time: number, delta: number, target: IEntity | null = null): void {
    if (!this.isActive) return;
    
    // Update AI behavior
    this.behavior.update(this, target, delta);
    
    // Update state machine
    this.fsm.update(delta);
  }
}