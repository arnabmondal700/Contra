// src/systems/WeaponSystem.ts
import Phaser from "phaser";
import { Player } from "../entities/player/Player";

export class WeaponSystem {
  constructor(_scene: Phaser.Scene) {}

  handleInput(player: Player): void {
    const weapon = player.getWeapon();
    if (!weapon) return;

    const inputState = player.getInputState();
    if (!inputState.fire) return;

    // Determine fire direction based on player facing and input
    const origin = new Phaser.Math.Vector2(player.x, player.y);
    let direction = new Phaser.Math.Vector2(1, 0);
    
    if (player.isFacingRight()) {
      direction = new Phaser.Math.Vector2(1, 0);
    } else {
      direction = new Phaser.Math.Vector2(-1, 0);
    }

    // Fire the weapon
    weapon.fire(origin, direction, player);
  }
}