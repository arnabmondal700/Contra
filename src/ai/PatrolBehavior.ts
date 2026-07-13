// src/ai/PatrolBehavior.ts
import { IAiBehavior } from "./IAiBehavior";
import { Enemy } from "../entities/enemies/Enemy";
import { IEntity } from "../types/IEntity";

export class PatrolBehavior implements IAiBehavior {
  private readonly speed = 40;
  private readonly range = 120;
  private originX: number | null = null;

  update(enemy: Enemy, _player: IEntity | null, _delta: number): void {
    if (!enemy.isEnemyActive()) return;
    if (this.originX === null) {
      this.originX = enemy.x; // remember spawn point the first time this runs
    }

    const body = enemy.body as Phaser.Physics.Arcade.Body;
    const minX = this.originX - this.range;
    const maxX = this.originX + this.range;

    if (enemy.x <= minX) {
      enemy.setFacingRight(true);
    } else if (enemy.x >= maxX) {
      enemy.setFacingRight(false);
    }

    body.setVelocityX(enemy.isFacingRight() ? this.speed : -this.speed);
  }
}