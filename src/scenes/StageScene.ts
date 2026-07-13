// src/scenes/StageScene.ts
import Phaser from "phaser";
import { EventBus } from "../core/EventBus";
import { Player } from "../entities/player/Player";
import { Enemy } from "../entities/enemies/Enemy";
import { InputSystem } from "../systems/InputSystem";
import { CameraSystem } from "../systems/CameraSystem";
import { WeaponSystem } from "../systems/WeaponSystem";
import { CollisionSystem } from "../systems/CollisionSystem";
import { SpawnSystem } from "../systems/SpawnSystem";
import { MachineGun } from "../weapons/MachineGun";
import { SpreadGun } from "../weapons/SpreadGun";
import { LaserGun } from "../weapons/LaserGun";
import { FireGun } from "../weapons/FireGun";
import { Pickup } from "../entities/pickups/Pickup";
import { getStageConfig, StageConfig } from "../data/StageData";
import { AudioManager } from "../managers/AudioManager";

export class StageScene extends Phaser.Scene {
  private inputSystem!: InputSystem;
  private cameraSystem!: CameraSystem;
  private weaponSystem!: WeaponSystem;
  private collisionSystem!: CollisionSystem;
  private spawnSystem!: SpawnSystem;
  private player1!: Player;
  private player2?: Player;
  private ground!: Phaser.Physics.Arcade.StaticGroup;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private playerCount: number;
  private machineGun!: MachineGun;
  private spreadGun!: SpreadGun;
  private laserGun!: LaserGun;
  private fireGun!: FireGun;
  private enemyWeapon!: MachineGun; // NEW
  private pickups!: Phaser.Physics.Arcade.Group;
  private stageConfig: StageConfig | null = null;
  private stageId = "stage1";
  private checkpoint?: { x: number; y: number };
  private bossTriggered = false;

  constructor() {
    super({ key: "stage" });
    this.playerCount = 1;
  }

  init(data: { stageId: string; playerCount: number; checkpoint?: { x: number; y: number } }): void {
    console.log(`[StageScene] Starting ${data.stageId} with ${data.playerCount} player(s)`);
    this.stageId = data.stageId;
    this.playerCount = data.playerCount;
    this.checkpoint = data.checkpoint;
    this.bossTriggered = false;
    this.stageConfig = getStageConfig(data.stageId) ?? null;
    if (!this.stageConfig) {
      console.error(`[StageScene] Unknown stage: ${data.stageId}`);
    }
  }

  create(): void {
    const config = this.stageConfig;
    if (!config) {
      this.scene.start("mainmenu");
      return;
    }

    AudioManager.getInstance().init(this);
    AudioManager.getInstance().resumeAudioContext();

    // Set background color based on stage theme
    this.cameras.main.setBackgroundColor(config.theme.skyColor);

    // Create level geometry from stage data
    this.createLevelFromData(config);

    // Initialize systems
    this.inputSystem = new InputSystem(this);
    this.cameraSystem = new CameraSystem(this);
    this.weaponSystem = new WeaponSystem(this);
    this.collisionSystem = new CollisionSystem(this);

    // Set camera bounds to level size
    this.cameraSystem.setLevelBounds(new Phaser.Geom.Rectangle(0, 0, config.width, config.height));

    // Create players first so combat systems can reference them
    this.createPlayers(config);

    // Set up combat systems
    this.setupCombat(config);

    // Set up camera to follow players
    const players = this.playerCount === 2 ? [this.player1, this.player2!] : [this.player1];
    this.cameraSystem.setPlayers(players);

    // Set up collisions — REMOVED duplicate call, setupCombat() already does this

    // Set up spawn system
    this.spawnSystem = new SpawnSystem(this, config, this.enemies, this.pickups, this.enemyWeapon);
    this.spawnSystem.spawnPickups();

    // Launch touch controls on touch devices
    if (this.inputSystem.hasTouchInput()) {
      this.inputSystem.createTouchControls();
    }

    // Launch HUD overlay
    this.scene.launch("hud", { playerCount: this.playerCount });

    // Display stage name
    const stageNameText = this.add.text(config.width / 2, 200, `STAGE ${config.id.toUpperCase()} - ${config.name}`, {
      font: "32px monospace",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(999);
    this.tweens.add({
      targets: stageNameText,
      alpha: 0,
      delay: 2000,
      duration: 500,
      onComplete: () => stageNameText.destroy(),
    });

    // Game-over check when a player dies and no one is left alive
    EventBus.on("PLAYER_DIED", () => {
      const allPlayers = this.playerCount === 2 ? [this.player1, this.player2] : [this.player1];
      const anyAlive = allPlayers.some((p) => p && p.active);
      if (!anyAlive) {
        this.time.delayedCall(1200, () => {
          this.scene.start("gameover", {
            score: 0,
            stageId: this.stageId,
            playerCount: this.playerCount,
            checkpoint: this.checkpoint,
          });
        });
      }
    });

    // Pause handler
    this.input.keyboard!.on("keydown-ESC", () => {
      this.scene.pause();
      this.scene.launch("pause", { previousScene: "stage" });
    });
  }

  private createLevelFromData(config: StageConfig): void {
    this.ground = this.physics.add.staticGroup();
    this.platforms = this.physics.add.staticGroup();

    // Create ground segments
    for (const seg of config.groundSegments) {
      const segWidth = Math.ceil(seg.width / 100);
      for (let i = 0; i < segWidth; i++) {
        const segment = this.ground.create(seg.x + i * 100 + 50, seg.y + seg.height / 2, "ground");
        segment.setDisplaySize(100, seg.height);
        segment.setTint(config.theme.groundColor);
        segment.refreshBody();
      }
    }

    // Create platforms
    const platformGraphics = this.make.graphics({ x: 0, y: 0 });
    platformGraphics.fillStyle(config.theme.platformColor, 1);
    platformGraphics.fillRect(0, 0, 100, 16);
    platformGraphics.generateTexture("platform", 100, 16);
    platformGraphics.destroy();

    for (const plat of config.platforms) {
      const segments = Math.ceil(plat.width / 100);
      for (let i = 0; i < segments; i++) {
        const p = this.platforms.create(plat.x + i * 100 + 50, plat.y, "platform");
        p.setDisplaySize(100, 16);
        p.setTint(config.theme.platformColor);
        p.refreshBody();
      }
    }

    // Controls hint
    this.add.text(100, 100, `STAGE: ${config.name}`, {
      font: "14px monospace",
      color: "#ffffff",
    }).setScrollFactor(0).setDepth(999);

    this.add.text(100, 120, "Arrows/WASD: Move | Z/Tab: Jump | X/Shift: Fire | Down: Crouch | ESC: Pause", {
      font: "12px monospace",
      color: "#aaaaaa",
    }).setScrollFactor(0).setDepth(999);
  }

  private createPlayers(config: StageConfig): void {
    const startX = this.checkpoint?.x ?? config.playerStart.x;
    const startY = this.checkpoint?.y ?? config.playerStart.y;

    // Player 1
    const p1Input = this.inputSystem.getPlayer1Input();
    this.player1 = new Player(this, startX, startY, 1, p1Input);

    // Player 2 (if 2 player mode)
    if (this.playerCount === 2) {
      const p2Input = this.inputSystem.getPlayer2Input();
      this.player2 = new Player(this, startX + 50, startY, 2, p2Input);
    }
  }

  private setupCombat(config: StageConfig): void {
    // Create bullet group with pooled bullets
    this.bullets = this.physics.add.group({
      defaultKey: "machinegun_bullet",
      maxSize: config.enemyPoolSize * 5,
      runChildUpdate: true,
    });

    // Create enemy bullet group
    this.enemyBullets = this.physics.add.group({
      defaultKey: "machinegun_bullet",
      maxSize: config.enemyPoolSize * 3,
      runChildUpdate: true,
    });

    // Create enemy group
    this.enemies = this.physics.add.group({
      runChildUpdate: false,
    });

    // Create pickup group
    this.pickups = this.physics.add.group({
      runChildUpdate: true,
    });

    // Create weapons
    this.machineGun = new MachineGun(this);
    this.spreadGun = new SpreadGun(this);
    this.laserGun = new LaserGun(this);
    this.fireGun = new FireGun(this);

    // NEW — wire weapons to the bullet group so physics.add.overlap can find them
    for (const weapon of [this.machineGun, this.spreadGun, this.laserGun, this.fireGun]) {
      weapon.setBulletGroup(this.bullets);
    }

    // NEW — create enemy weapon bound to enemyBullets
    this.enemyWeapon = new MachineGun(this);
    this.enemyWeapon.setBulletGroup(this.enemyBullets);

    // Give P1 MachineGun by default
    this.player1.setWeapon(this.machineGun);

    // Give P2 MachineGun if 2 player mode
    if (this.player2) {
      this.player2.setWeapon(this.machineGun);
    }

    // Set up weapon system input handling
    this.weaponSystem.handleInput(this.player1);
    if (this.player2) {
      this.weaponSystem.handleInput(this.player2);
    }

    // Set up collisions
    this.setupCollisions();
    this.setupPickupCollisions();

    // Set up bullet-enemy collisions
    this.collisionSystem.registerBulletEnemyCollisions(this.bullets, this.enemies);

    // Set up enemy bullet-player collisions
    this.collisionSystem.registerBulletPlayerCollisions(this.enemyBullets, this.player1);
    if (this.player2) {
      this.collisionSystem.registerBulletPlayerCollisions(this.enemyBullets, this.player2);
    }

    // Set up terrain collisions for enemy bullets
    this.collisionSystem.registerTerrainCollisions(this.enemyBullets, this.ground);
    this.collisionSystem.registerTerrainCollisions(this.enemyBullets, this.platforms);
  }

  private setupPickupCollisions(): void {
    const players: Player[] = this.player2 ? [this.player1, this.player2] : [this.player1];

    for (const player of players) {
      this.physics.add.overlap(player, this.pickups, (_player, pickup) => {
        const pickupEntity = pickup as unknown as Pickup;
        const type = pickupEntity.getPickupType();
        let weapon;
        switch (type) {
          case "spreadgun":
            weapon = this.spreadGun;
            break;
          case "lasergun":
            weapon = this.laserGun;
            break;
          case "firegun":
            weapon = this.fireGun;
            break;
          case "machinegun":
          default:
            weapon = this.machineGun;
            break;
        }
        player.setWeapon(weapon);
        this.weaponSystem.handleInput(player);
        pickupEntity.destroy();
        console.log(`[StageScene] P${player.getPlayerId()} collected ${type}`);
      });
    }
  }

  private setupCollisions(): void {
    // Player 1 collisions
    this.physics.add.collider(this.player1, this.ground, () => {
      this.player1.setGrounded(true);
    });
    this.physics.add.collider(this.player1, this.platforms, () => {
      this.player1.setGrounded(true);
    });

    // Player 2 collisions
    if (this.player2) {
      this.physics.add.collider(this.player2, this.ground, () => {
        this.player2!.setGrounded(true);
      });
      this.physics.add.collider(this.player2, this.platforms, () => {
        this.player2!.setGrounded(true);
      });
    }

    // NEW — enemies had no floor collision at all
    this.physics.add.collider(this.enemies, this.ground);
    this.physics.add.collider(this.enemies, this.platforms);

    // NEW — player contact damage with enemies
    this.physics.add.overlap(this.player1, this.enemies, (playerObj, enemyObj) => {
      const p = playerObj as Player;
      const e = enemyObj as Enemy;
      if (!e.isEnemyActive() || p.isInvincible()) return;
      p.takeDamage(1, e);
    });

    if (this.player2) {
      this.physics.add.overlap(this.player2, this.enemies, (playerObj, enemyObj) => {
        const p = playerObj as Player;
        const e = enemyObj as Enemy;
        if (!e.isEnemyActive() || p.isInvincible()) return;
        p.takeDamage(1, e);
      });
    }

    // World bounds — CHANGED: bottom was false, now true to stop enemies (and players) from falling through
    const config = this.stageConfig!;
    this.physics.world.setBounds(0, 0, config.width, config.height, true, true, true, true);
  }

  update(_time: number, delta: number): void {
    this.inputSystem.update();
    this.cameraSystem.update();
    this.player1.update(_time, delta);
    this.weaponSystem.handleInput(this.player1);
    if (this.player2) {
      this.player2.update(_time, delta);
      this.weaponSystem.handleInput(this.player2);
    }
    this.player1.setGrounded(false);
    if (this.player2) {
      this.player2.setGrounded(false);
    }

    // Update spawn system
    if (this.spawnSystem) {
      this.spawnSystem.update(this.cameras.main.scrollX);
    }

    // Update enemies with player target
    const target = this.player1.active ? this.player1 : (this.player2?.active ? this.player2! : null);
    if (target) {
      this.enemies.getChildren().forEach((child) => {
        const enemy = child as Enemy;
        if (enemy.isEnemyActive()) {
          enemy.update(_time, delta, target);
        }
      });
    }

    this.checkBossTrigger();
  }

  private checkBossTrigger(): void {
    const config = this.stageConfig;
    if (!config || this.bossTriggered || !this.player1.active) return;
    const p1 = this.player1.body as Phaser.Physics.Arcade.Body;
    if (p1 && p1.x > config.bossTriggerX) {
      this.bossTriggered = true;
      const checkpoint = { x: p1.x, y: p1.y };
      this.scene.start("boss", {
        stageId: this.stageId,
        bossId: config.bossId,
        playerState: { playerCount: this.playerCount, checkpoint },
      });
    }
  }
}