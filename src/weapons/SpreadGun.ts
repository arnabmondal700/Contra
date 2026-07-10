// src/weapons/SpreadGun.ts
import Phaser from "phaser";
import { IWeapon } from "../types/IWeapon";
import { ObjectPool } from "../core/ObjectPool";
import { Projectile } from "../entities/projectiles/Projectile";
import { IEntity } from "../types/IEntity";
import { PHYSICS_CONFIG } from "../config/PhysicsConfig";

export class SpreadGun implements IWeapon {
  readonly id = "spreadgun";
  readonly ammo = -1; // infinite
  readonly maxAmmo = -1;
  readonly fireRateMs = 250;

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
        PHYSICS_CONFIG.projectile.speed,
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
    const key = "spreadgun_bullet";
    if (this.scene.textures.exists(key)) return key;

    const graphics = this.scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 8, 4);
    graphics.generateTexture(key, 8, 4);
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

    const angles = [-15, -7.5, 0, 7.5, 15];
    for (const deg of angles) {
      const radians = Phaser.Math.DegToRad(deg);
      const rotatedDirection = direction.clone().rotate(radians);
      const projectile = this.pool.acquire();
      projectile.setOwner(owner);
      projectile.setPosition(origin.x, origin.y);
      projectile.launch(origin, rotatedDirection);
    }
  }

  reload(): void {
    // No-op for infinite ammo weapon
  }

  getPool(): ObjectPool<Projectile> {
    return this.pool;
  }
}