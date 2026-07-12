// src/entities/projectiles/Projectile.ts
import Phaser from "phaser";
import { BaseEntity } from "../BaseEntity";
import { IEntity } from "../../types/IEntity";
import { ObjectPool } from "../../core/ObjectPool";

export class Projectile extends BaseEntity {
  private owner: IEntity;
  private damage: number;
  private speed: number;
  private direction: Phaser.Math.Vector2;
  private maxDistance = 800; // Max travel distance
  private traveledDistance = 0;
  private pool?: ObjectPool<Projectile>;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    owner: IEntity,
    damage: number,
    speed: number,
    direction: Phaser.Math.Vector2
  ) {
    super(scene, x, y, texture, 1);
    
    this.owner = owner;
    this.damage = damage;
    this.speed = speed;
    this.direction = direction.clone().normalize();

    // Physics setup
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(8, 4);
    body.setOffset(0, 0);
    body.setCollideWorldBounds(false);
    body.allowGravity = false;
    body.setImmovable(true);
    body.setMaxVelocity(this.speed, this.speed);
  }

  launch(origin: Phaser.Math.Vector2, direction: Phaser.Math.Vector2): void {
    this.setPosition(origin.x, origin.y);
    this.direction = direction.clone().normalize();
    this.traveledDistance = 0;
    
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(this.direction.x * this.speed, this.direction.y * this.speed);
    
    // Rotate to face direction
    this.rotation = Phaser.Math.Angle.Between(0, 0, this.direction.x, this.direction.y);
  }

  update(_time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    
    // Track distance traveled
    const dx = body.velocity.x * (delta / 1000);
    const dy = body.velocity.y * (delta / 1000);
    this.traveledDistance += Math.sqrt(dx * dx + dy * dy);

    // Destroy if traveled max distance
    if (this.traveledDistance >= this.maxDistance) {
      this.deactivate();
    }

    // Check if out of camera bounds (with margin)
    const camera = this.scene.cameras.main;
    if (
      this.x < camera.worldView.x - 100 ||
      this.x > camera.worldView.x + camera.worldView.width + 100 ||
      this.y < camera.worldView.y - 100 ||
      this.y > camera.worldView.y + camera.worldView.height + 100
    ) {
      this.deactivate();
    }
  }

  getOwner(): IEntity {
    return this.owner;
  }

  getDamage(): number {
    return this.damage;
  }

  setOwner(owner: IEntity): void {
    this.owner = owner;
  }

  setPool(pool: ObjectPool<Projectile>): void {
    this.pool = pool;
  }

  deactivate(): void {
    if (this.pool) {
      this.pool.release(this);
    } else {
      this.destroy();
    }
  }
}
