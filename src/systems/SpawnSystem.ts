// src/systems/SpawnSystem.ts
import Phaser from "phaser";
import { EnemyFactory } from "../entities/enemies/EnemyFactory";
import { PickupFactory } from "../entities/pickups/PickupFactory";
import { StageConfig } from "../data/StageData";
import { Enemy } from "../entities/enemies/Enemy";

export class SpawnSystem {
  private scene: Phaser.Scene;
  private stageConfig: StageConfig;
  private enemies: Phaser.Physics.Arcade.Group;
  private pickups: Phaser.Physics.Arcade.Group;
  private nextSpawnIndex = 0;
  private activeEnemyCount = 0;
  private spawnedEnemies: Set<number> = new Set();

  constructor(
    scene: Phaser.Scene,
    stageConfig: StageConfig,
    enemies: Phaser.Physics.Arcade.Group,
    pickups: Phaser.Physics.Arcade.Group
  ) {
    this.scene = scene;
    this.stageConfig = stageConfig;
    this.enemies = enemies;
    this.pickups = pickups;
  }

  update(cameraX: number): void {
    this.spawnEnemies(cameraX);
  }

  private spawnEnemies(cameraX: number): void {
    const viewportLeft = cameraX - 100;
    const viewportRight = cameraX + 900; // 800px screen + margin

    for (let i = this.nextSpawnIndex; i < this.stageConfig.enemySpawns.length; i++) {
      const spawn = this.stageConfig.enemySpawns[i];
      if (spawn.triggerX > cameraX + 900) break; // Too far ahead, stop checking

      if (spawn.triggerX <= cameraX + 900 && !this.spawnedEnemies.has(i)) {
        if (this.activeEnemyCount >= this.stageConfig.enemyPoolSize) {
          // Pool full, skip for now but mark as ready to spawn later
          continue;
        }
        this.spawnedEnemies.add(i);
        this.nextSpawnIndex = i + 1;
        this.spawnOneEnemy(spawn.type, spawn.x, spawn.y);
      }
    }

    // Clean up off-screen enemies
    this.enemies.getChildren().forEach((child) => {
      const enemy = child as unknown as Enemy;
      if (enemy.active && enemy.isEnemyActive()) {
        if (enemy.x < viewportLeft - 200 || enemy.x > viewportRight + 200) {
          enemy.deactivate();
          this.activeEnemyCount = Math.max(0, this.activeEnemyCount - 1);
        }
      }
    });
  }

  private spawnOneEnemy(type: string, x: number, y: number): void {
    try {
      const enemy = EnemyFactory.create(type, this.scene, x, y);
      enemy.activate();
      this.enemies.add(enemy);
      this.activeEnemyCount++;
    } catch (e) {
      console.error(`[SpawnSystem] Failed to spawn enemy type "${type}":`, e);
    }
  }

  spawnPickups(): void {
    for (const spawn of this.stageConfig.pickupSpawns) {
      try {
        const pickup = PickupFactory.create(this.scene, spawn.x, spawn.y, spawn.type);
        this.pickups.add(pickup);
      } catch (e) {
        console.error(`[SpawnSystem] Failed to spawn pickup:`, e);
      }
    }
  }

  reset(): void {
    this.nextSpawnIndex = 0;
    this.activeEnemyCount = 0;
    this.spawnedEnemies.clear();
  }

  getActiveCount(): number {
    return this.activeEnemyCount;
  }
}