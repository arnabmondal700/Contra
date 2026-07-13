// src/types/IWeapon.ts
import { IEntity } from "./IEntity";

export interface IWeapon {
  readonly id: string;
  readonly ammo: number;
  readonly maxAmmo: number;
  readonly fireRateMs: number;
  fire(origin: Phaser.Math.Vector2, direction: Phaser.Math.Vector2, owner: IEntity): void;
  reload(): void;
  canFire(): boolean;
  setBulletGroup(group: Phaser.Physics.Arcade.Group): void;
}