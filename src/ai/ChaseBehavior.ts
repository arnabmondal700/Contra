// src/ai/ChaseBehavior.ts
import { IAiBehavior } from "./IAiBehavior";
import { Enemy } from "../entities/enemies/Enemy";
import { IEntity } from "../types/IEntity";

export class ChaseBehavior implements IAiBehavior {
  private readonly chaseSpeed = 60;
  private readonly detectionRange = 400;

  update(enemy: Enemy, player: IEntity, _delta: number): void {
    if (!player || !enemy.isEnemyActive()) return;

    const playerSprite = player as unknown as Phaser.Physics.Arcade.Sprite;
    const dx = playerSprite.x - enemy.x;
    const distance = Math.abs(dx);

    if (distance <= this.detectionRange) {
      const direction = dx > 0 ? 1 : -1;
      const body = enemy.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(direction * this.chaseSpeed);
      enemy.setFacingRight(direction > 0);
    }
  }
}