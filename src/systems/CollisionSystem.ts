// src/systems/CollisionSystem.ts
import Phaser from "phaser";
import { Projectile } from "../entities/projectiles/Projectile";
import { Enemy } from "../entities/enemies/Enemy";
import { Player } from "../entities/player/Player";

export class CollisionSystem {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  registerBulletEnemyCollisions(
    bulletGroup: Phaser.Physics.Arcade.Group,
    enemyGroup: Phaser.Physics.Arcade.Group
  ): void {
    this.scene.physics.add.overlap(
      bulletGroup,
      enemyGroup,
      (bullet: unknown, enemy: unknown) => {
        const projectile = bullet as Projectile;
        const enemyEntity = enemy as Enemy;
        
        if (!projectile.active || !enemyEntity.isEnemyActive()) return;
        
        const damage = projectile.getDamage();
        const owner = projectile.getOwner();
        
        // Damage the enemy
        enemyEntity.takeDamage(damage, owner);
        
        // Destroy the bullet
        projectile.destroy();
      }
    );
  }

  registerBulletPlayerCollisions(
    bulletGroup: Phaser.Physics.Arcade.Group,
    player: Player
  ): void {
    this.scene.physics.add.overlap(
      bulletGroup,
      player,
      (bullet: unknown, playerEntity: unknown) => {
        const projectile = bullet as Projectile;
        const playerObj = playerEntity as Player;
        
        if (!projectile.active || playerObj.isInvincible()) return;
        
        // Damage the player
        playerObj.takeDamage(1, projectile.getOwner());
        
        // Destroy the bullet
        projectile.destroy();
      }
    );
  }

  registerTerrainCollisions(
    group: Phaser.Physics.Arcade.Group,
    terrain: Phaser.Physics.Arcade.StaticGroup
  ): void {
    this.scene.physics.add.collider(group, terrain, (gameObject: unknown) => {
      const obj = gameObject as Projectile;
      if (obj.active) {
        obj.destroy();
      }
    });
  }
}