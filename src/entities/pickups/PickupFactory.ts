// src/entities/pickups/PickupFactory.ts
import { Pickup, PickupType } from "./Pickup";

export class PickupFactory {
  private static readonly spawnTable: Record<PickupType, number> = {
    machinegun: 60,
    spreadgun: 20,
    lasergun: 15,
    firegun: 10,
  };

  static randomWeaponType(): PickupType {
    const entries = Object.entries(this.spawnTable);
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = Math.random() * total;
    for (const [type, weight] of entries) {
      roll -= weight;
      if (roll <= 0) return type as PickupType;
    }
    return "machinegun";
  }

  static create(scene: Phaser.Scene, x: number, y: number, type: PickupType): Pickup {
    return new Pickup(scene, x, y, type);
  }
}