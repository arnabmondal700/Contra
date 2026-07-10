// src/entities/enemies/EnemyFactory.ts
import { Enemy } from "./Enemy";
import { SoldierEnemy } from "./SoldierEnemy";
import { SniperEnemy } from "./SniperEnemy";
import { TurretEnemy } from "./TurretEnemy";
import { AlienEnemy } from "./AlienEnemy";
import { PatrolBehavior } from "../../ai/PatrolBehavior";
import { ChaseBehavior } from "../../ai/ChaseBehavior";
import { TurretBehavior } from "../../ai/TurretBehavior";

export class EnemyFactory {
  private static registry: Record<string, (scene: Phaser.Scene, x: number, y: number) => Enemy> = {
    soldier: (_scene: Phaser.Scene, _x: number, _y: number) => {
      const enemy = new SoldierEnemy(_scene, _x, _y, new PatrolBehavior());
      return enemy as unknown as Enemy;
    },
    sniper: (_scene: Phaser.Scene, _x: number, _y: number) => {
      const enemy = new SniperEnemy(_scene, _x, _y, new PatrolBehavior());
      return enemy as unknown as Enemy;
    },
    turret: (_scene: Phaser.Scene, _x: number, _y: number) => {
      const enemy = new TurretEnemy(_scene, _x, _y, new TurretBehavior());
      return enemy as unknown as Enemy;
    },
    alien: (_scene: Phaser.Scene, _x: number, _y: number) => {
      const enemy = new AlienEnemy(_scene, _x, _y, new ChaseBehavior());
      return enemy as unknown as Enemy;
    },
  };

  static create(type: string, scene: Phaser.Scene, x: number, y: number): Enemy {
    const factory = this.registry[type];
    if (!factory) {
      throw new Error(`Unknown enemy type: ${type}`);
    }
    return factory(scene, x, y);
  }

  static register(type: string, factory: (scene: Phaser.Scene, x: number, y: number) => Enemy): void {
    this.registry[type] = factory;
  }
}
