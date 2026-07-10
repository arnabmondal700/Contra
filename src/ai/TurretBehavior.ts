// src/ai/TurretBehavior.ts
import { IAiBehavior } from "./IAiBehavior";
import { Enemy } from "../entities/enemies/Enemy";
import { IEntity } from "../types/IEntity";

export class TurretBehavior implements IAiBehavior {
  private readonly detectionRange = 300;

  update(enemy: Enemy, player: IEntity, _delta: number): void {
    if (!player || !enemy.isEnemyActive()) return;

    const playerSprite = player as unknown as Phaser.Physics.Arcade.Sprite;
    const dx = playerSprite.x - enemy.x;
    const distance = Math.abs(dx);

    if (distance <= this.detectionRange) {
      enemy.setFacingRight(dx > 0);
    }
  }
}