// src/entities/pickups/Pickup.ts
import Phaser from "phaser";
import { BaseEntity } from "../BaseEntity";

export type PickupType = "spreadgun" | "lasergun" | "firegun" | "machinegun";

export class Pickup extends BaseEntity {
  private readonly lifetimeMs = 8000;
  private spawnTime = 0;
  private readonly pickupType: PickupType;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    pickupType: PickupType
  ) {
    super(scene, x, y, "pickup", 1);
    this.pickupType = pickupType;
    this.spawnTime = scene.time.now;
    this.createPlaceholderTexture();
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    this.setActive(true).setVisible(true);
  }

  private createPlaceholderTexture(): void {
    const key = "pickup";
    if (this.scene.textures.exists(key)) return;

    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    switch (this.pickupType) {
      case "spreadgun":
        graphics.fillStyle(0x00ff00, 1);
        break;
      case "lasergun":
        graphics.fillStyle(0x00ffff, 1);
        break;
      case "firegun":
        graphics.fillStyle(0xff8800, 1);
        break;
      case "machinegun":
      default:
        graphics.fillStyle(0xffff00, 1);
        break;
    }
    graphics.fillRect(0, 0, 12, 12);
    graphics.generateTexture(key, 12, 12);
    graphics.destroy();
  }

  getPickupType(): PickupType {
    return this.pickupType;
  }

  isExpired(now: number): boolean {
    return now - this.spawnTime > this.lifetimeMs;
  }

  update(_time: number, _delta: number): void {
    if (this.isExpired(_time)) {
      this.destroy();
    }
  }
}