// src/systems/CameraSystem.ts
import Phaser from "phaser";
import { Player } from "../entities/player/Player";
import { PHYSICS_CONFIG } from "../config/PhysicsConfig";

export class CameraSystem {
  private camera: Phaser.Cameras.Scene2D.Camera;
  private players: Player[] = [];
  private levelBounds: Phaser.Geom.Rectangle;
  private isLockedToBoss = false;
  private bossArenaBounds?: Phaser.Geom.Rectangle;

  constructor(scene: Phaser.Scene) {
    this.camera = scene.cameras.main;
    this.levelBounds = new Phaser.Geom.Rectangle(0, 0, 8000, 600); // Default, will be set by StageScene
  }

  setLevelBounds(bounds: Phaser.Geom.Rectangle): void {
    this.levelBounds = bounds;
    this.camera.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
  }

  setPlayers(players: Player[]): void {
    this.players = players;
  }

  addPlayer(player: Player): void {
    this.players.push(player);
  }

  removePlayer(player: Player): void {
    const index = this.players.indexOf(player);
    if (index !== -1) {
      this.players.splice(index, 1);
    }
  }

  update(): void {
    if (this.isLockedToBoss && this.bossArenaBounds) {
      this.clampToBossArena();
      return;
    }

    if (this.players.length === 0) return;

    if (this.players.length === 1) {
      this.followSinglePlayer(this.players[0]);
    } else {
      this.followMultiplePlayers(this.players);
    }

    this.clampToLevelBounds();
  }

  private followSinglePlayer(player: Player): void {
    const lerp = PHYSICS_CONFIG.camera.lerp;
    const deadzone = PHYSICS_CONFIG.camera.deadzone;
    
    this.camera.startFollow(player, true, lerp.x, lerp.y);
    this.camera.setDeadzone(deadzone.x, deadzone.y);
  }

  private followMultiplePlayers(players: Player[]): void {
    // Calculate midpoint between all players
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const player of players) {
      minX = Math.min(minX, player.x);
      maxX = Math.max(maxX, player.x);
      minY = Math.min(minY, player.y);
      maxY = Math.max(maxY, player.y);
    }

    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    // Create a temporary target for camera to follow
    // We'll manually set camera position instead of using startFollow
    this.camera.stopFollow();
    
    const lerp = PHYSICS_CONFIG.camera.lerp;
    
    // Smooth camera movement toward midpoint
    this.camera.scrollX = Phaser.Math.Linear(this.camera.scrollX, midX - this.camera.width / 2, lerp.x);
    this.camera.scrollY = Phaser.Math.Linear(this.camera.scrollY, midY - this.camera.height / 2, lerp.y);

    // Optional: zoom out to keep both players in view
    const distance = maxX - minX;
    const targetZoom = Phaser.Math.Clamp(800 / Math.max(800, distance + 200), 0.5, 1);
    this.camera.zoom = Phaser.Math.Linear(this.camera.zoom, targetZoom, 0.05);
  }

  private clampToLevelBounds(): void {
    // Camera bounds are already set via setBounds, but we ensure we don't go beyond
    if (this.camera.scrollX < this.levelBounds.x) {
      this.camera.scrollX = this.levelBounds.x;
    }
    if (this.camera.scrollX > this.levelBounds.x + this.levelBounds.width - this.camera.width) {
      this.camera.scrollX = this.levelBounds.x + this.levelBounds.width - this.camera.width;
    }
    if (this.camera.scrollY < this.levelBounds.y) {
      this.camera.scrollY = this.levelBounds.y;
    }
    if (this.camera.scrollY > this.levelBounds.y + this.levelBounds.height - this.camera.height) {
      this.camera.scrollY = this.levelBounds.y + this.levelBounds.height - this.camera.height;
    }
  }

  private clampToBossArena(): void {
    if (!this.bossArenaBounds) return;
    
    this.camera.scrollX = Phaser.Math.Clamp(
      this.camera.scrollX,
      this.bossArenaBounds.x,
      this.bossArenaBounds.x + this.bossArenaBounds.width - this.camera.width
    );
    this.camera.scrollY = Phaser.Math.Clamp(
      this.camera.scrollY,
      this.bossArenaBounds.y,
      this.bossArenaBounds.y + this.bossArenaBounds.height - this.camera.height
    );
  }

  lockToBossArena(bounds: Phaser.Geom.Rectangle): void {
    this.isLockedToBoss = true;
    this.bossArenaBounds = bounds;
    this.camera.stopFollow();
  }

  unlockFromBossArena(): void {
    this.isLockedToBoss = false;
    this.bossArenaBounds = undefined;
  }

  shake(duration = PHYSICS_CONFIG.camera.shakeDuration, intensity = PHYSICS_CONFIG.camera.shakeIntensity): void {
    this.camera.shake(duration, intensity);
  }

  flash(duration = 100, color = 0xffffff): void {
    this.camera.flash(duration, color >> 16, (color >> 8) & 0xff, color & 0xff);
  }

  fadeOut(duration = 500, callback?: () => void): void {
    this.camera.fadeOut(duration, 0, 0, 0);
    if (callback) {
      this.camera.once("camerafadeoutcomplete", callback);
    }
  }

  fadeIn(duration = 500, callback?: () => void): void {
    this.camera.fadeIn(duration, 0, 0, 0);
    if (callback) {
      this.camera.once("camerafadeincomplete", callback);
    }
  }

  getCamera(): Phaser.Cameras.Scene2D.Camera {
    return this.camera;
  }
}