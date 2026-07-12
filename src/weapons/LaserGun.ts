// src/weapons/LaserGun.ts
import Phaser from "phaser";
import { IWeapon } from "../types/IWeapon";
import { ObjectPool } from "../core/ObjectPool";
import { Projectile } from "../entities/projectiles/Projectile";
import { IEntity } from "../types/IEntity";
import { PHYSICS_CONFIG } from "../config/PhysicsConfig";

export class LaserGun implements IWeapon {
  readonly id = "lasergun";
  readonly ammo = -1; // infinite
  readonly maxAmmo = -1;
  readonly fireRateMs = 350;

  private pool: ObjectPool<Projectile>;
  private lastFired = 0;
  private scene: Phaser.Scene;
  private projectileTexture: string;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.projectileTexture = this.createProjectileTexture();

    this.pool = new ObjectPool<Projectile>(
      () => new Projectile(
        scene,
        0,
        0,
        this.projectileTexture,
        null as unknown as IEntity,
        1,
        PHYSICS_CONFIG.projectile.speed * 1.3,
        new Phaser.Math.Vector2(1, 0)
      ),
      (projectile) => {
        projectile.setActive(false).setVisible(false);
        const body = projectile.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(0, 0);
      },
      PHYSICS_CONFIG.collision.maxPooledBullets
    );
  }

  private createProjectileTexture(): string {
    const key = "lasergun_bullet";
    if (this.scene.textures.exists(key)) return key;

    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x00ffff, 1);
    graphics.fillRect(0, 0, 16, 2);
    graphics.generateTexture(key, 16, 2);
    graphics.destroy();
    return key;
  }

  canFire(): boolean {
    return true;
  }

  fire(origin: Phaser.Math.Vector2, direction: Phaser.Math.Vector2, owner: IEntity): void {
    const now = this.scene.time.now;
    if (now - this.lastFired < this.fireRateMs) return;
    this.lastFired = now;

    const projectile = this.pool.acquire();
    projectile.setPool(this.pool);
    projectile.setOwner(owner);
    projectile.setPosition(origin.x, origin.y);
    projectile.launch(origin, direction);
  }

  reload(): void {
    // No-op for infinite ammo weapon
  }

  getPool(): ObjectPool<Projectile> {
    return this.pool;
  }
}