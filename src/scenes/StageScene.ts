// src/scenes/StageScene.ts
import Phaser from "phaser";
import { EventBus } from "../core/EventBus";
import { Player } from "../entities/player/Player";
import { InputSystem } from "../systems/InputSystem";
import { CameraSystem } from "../systems/CameraSystem";
import { WeaponSystem } from "../systems/WeaponSystem";
import { CollisionSystem } from "../systems/CollisionSystem";
import { MachineGun } from "../weapons/MachineGun";
import { SpreadGun } from "../weapons/SpreadGun";
import { LaserGun } from "../weapons/LaserGun";
import { FireGun } from "../weapons/FireGun";
import { EnemyFactory } from "../entities/enemies/EnemyFactory";
import { Pickup, PickupType } from "../entities/pickups/Pickup";
import { PickupFactory } from "../entities/pickups/PickupFactory";

export class StageScene extends Phaser.Scene {
  private inputSystem!: InputSystem;
  private cameraSystem!: CameraSystem;
  private weaponSystem!: WeaponSystem;
  private collisionSystem!: CollisionSystem;
  private player1!: Player;
  private player2?: Player;
  private ground!: Phaser.Physics.Arcade.StaticGroup;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private bullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private playerCount: number;
  private machineGun!: MachineGun;
  private spreadGun!: SpreadGun;
  private laserGun!: LaserGun;
  private fireGun!: FireGun;
  private pickups!: Phaser.Physics.Arcade.Group;
  // private _stageId: string; // unused for now, will be used for stage-specific logic
  private checkpoint?: { x: number; y: number };
  private bossTriggered = false;

  constructor() {
    super({ key: "stage" });
    this.playerCount = 1;
  }

  init(data: { stageId: string; playerCount: number; checkpoint?: { x: number; y: number } }): void {
    console.log(`[StageScene] Starting ${data.stageId} with ${data.playerCount} player(s)`);
    this.playerCount = data.playerCount;
    this.checkpoint = data.checkpoint;
    this.bossTriggered = false;
  }

  create(): void {
    // Create test level geometry
    this.createTestLevel();

    // Initialize systems
    this.inputSystem = new InputSystem(this);
    this.cameraSystem = new CameraSystem(this);
    this.weaponSystem = new WeaponSystem(this);
    this.collisionSystem = new CollisionSystem(this);

    // Set camera bounds to level size
    this.cameraSystem.setLevelBounds(new Phaser.Geom.Rectangle(0, 0, 8000, 600));

    // Create players first so combat systems can reference them
    this.createPlayers();
    
    // Set up combat systems
    this.setupCombat();
    
    // Set up camera to follow players
    const players = this.playerCount === 2 ? [this.player1, this.player2!] : [this.player1];
    this.cameraSystem.setPlayers(players);
    
    // Set up collisions
    this.setupCollisions();

    // Launch HUD overlay
    this.scene.launch("hud", { playerCount: this.playerCount });

    // Game-over check when a player dies and no one is left alive
    EventBus.on("PLAYER_DIED", () => {
      const allPlayers = this.playerCount === 2 ? [this.player1, this.player2] : [this.player1];
      const anyAlive = allPlayers.some((p) => p && p.active);
      if (!anyAlive) {
        this.time.delayedCall(1200, () => {
          this.scene.start("gameover", {
            score: 0,
            stageId: "stage1",
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

  private createTestLevel(): void {
    // Create ground and platforms using static physics bodies
    this.ground = this.physics.add.staticGroup();
    this.platforms = this.physics.add.staticGroup();
    
    // Main ground - full width of level
    const groundWidth = 8000;
    const groundHeight = 32;
    const groundY = 568; // Near bottom of 600px screen
    
    // Create ground using graphics
    const groundGraphics = this.make.graphics({ x: 0, y: 0 });
    groundGraphics.fillStyle(0x333333, 1);
    groundGraphics.fillRect(0, 0, groundWidth, groundHeight);
    groundGraphics.generateTexture("ground", groundWidth, groundHeight);
    groundGraphics.destroy();
    
    // Add ground segments (Phaser static bodies need individual sprites)
    for (let x = 0; x < groundWidth; x += 100) {
      const segment = this.ground.create(x + 50, groundY + groundHeight / 2, "ground");
      segment.setDisplaySize(100, groundHeight);
      segment.refreshBody();
    }
    
    // Add some platforms for jumping
    const platformPositions = [
      { x: 400, y: 450, width: 200 },
      { x: 800, y: 380, width: 150 },
      { x: 1200, y: 420, width: 250 },
      { x: 1600, y: 300, width: 180 },
      { x: 2000, y: 400, width: 300 },
      { x: 2500, y: 350, width: 200 },
      { x: 3000, y: 280, width: 220 },
      { x: 3500, y: 380, width: 180 },
      { x: 4000, y: 300, width: 250 },
      { x: 4500, y: 420, width: 200 },
      { x: 5000, y: 350, width: 300 },
      { x: 5500, y: 280, width: 180 },
      { x: 6000, y: 380, width: 220 },
      { x: 6500, y: 300, width: 250 },
      { x: 7000, y: 400, width: 200 },
      { x: 7500, y: 320, width: 300 },
    ];
    
    // Create platform texture
    const platformGraphics = this.make.graphics({ x: 0, y: 0 });
    platformGraphics.fillStyle(0x555555, 1);
    platformGraphics.fillRect(0, 0, 100, 16);
    platformGraphics.generateTexture("platform", 100, 16);
    platformGraphics.destroy();
    
    for (const pos of platformPositions) {
      const segments = Math.ceil(pos.width / 100);
      for (let i = 0; i < segments; i++) {
        const plat = this.platforms.create(pos.x + i * 100 + 50, pos.y, "platform");
        plat.setDisplaySize(100, 16);
        plat.refreshBody();
      }
    }
    
    // Add some visual markers
    this.add.text(100, 100, "STAGE 1 - TEST LEVEL", { font: "24px monospace", color: "#ffffff" }).setScrollFactor(0);
    this.add.text(100, 130, "Arrow Keys/WASD: Move  |  Z/Tab: Jump  |  X/Shift: Fire  |  ESC: Pause", { font: "14px monospace", color: "#aaaaaa" }).setScrollFactor(0);
    this.add.text(100, 150, "Down: Crouch  |  Down+Jump: Prone", { font: "14px monospace", color: "#aaaaaa" }).setScrollFactor(0);
  }

  private createPlayers(): void {
    const startX = this.checkpoint?.x ?? 100;
    const startY = this.checkpoint?.y ?? 500;
    
    // Player 1
    const p1Input = this.inputSystem.getPlayer1Input();
    this.player1 = new Player(this, startX, startY, 1, p1Input);
    
    // Player 2 (if 2 player mode)
    if (this.playerCount === 2) {
      const p2Input = this.inputSystem.getPlayer2Input();
      this.player2 = new Player(this, startX + 50, startY, 2, p2Input);
    }
  }

  private setupCombat(): void {
    // Create bullet group with pooled bullets for MachineGun
    this.bullets = this.physics.add.group({
      defaultKey: "machinegun_bullet",
      maxSize: 60,
      runChildUpdate: true,
    });

    // Create enemy group
    this.enemies = this.physics.add.group({
      runChildUpdate: true,
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

    // Give P1 MachineGun by default
    this.player1.setWeapon(this.machineGun);

    // Set up weapon system for P1
    this.weaponSystem.handleInput(this.player1);

    // Spawn test enemies using EnemyFactory
    this.spawnEnemy("soldier", 600, 500);
    this.spawnEnemy("soldier", 900, 500);
    this.spawnEnemy("sniper", 1200, 500);
    this.spawnEnemy("turret", 1500, 500);
    this.spawnEnemy("alien", 1800, 300);

    // Spawn test pickups
    this.spawnPickup(400, 500, "spreadgun");
    this.spawnPickup(1000, 500, "lasergun");
    this.spawnPickup(1400, 500, "firegun");

    // Set up collisions
    this.setupCollisions();
    this.setupPickupCollisions();

    // Set up bullet-enemy collisions
    this.collisionSystem.registerBulletEnemyCollisions(this.bullets, this.enemies);
  }

  private setupPickupCollisions(): void {
    this.physics.add.overlap(this.player1, this.pickups, (_player, pickup) => {
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
      this.player1.setWeapon(weapon);
      this.weaponSystem.handleInput(this.player1);
      pickupEntity.destroy();
      console.log(`[StageScene] P1 collected ${type}`);
    });
  }

  private spawnEnemy(type: string, x: number, y: number): void {
    const enemy = EnemyFactory.create(type, this, x, y);
    enemy.activate();
    this.enemies.add(enemy);
  }

  private spawnPickup(x: number, y: number, type: PickupType): void {
    const pickup = PickupFactory.create(this, x, y, type);
    this.pickups.add(pickup);
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

      // Player-player collision (optional - for now they pass through each other)
      // this.physics.add.collider(this.player1, this.player2);
    }

    // World bounds collision for ground detection
    this.physics.world.setBounds(0, 0, 8000, 600, true, true, true, false);
  }

  update(time: number, delta: number): void {
    this.inputSystem.update();
    this.cameraSystem.update();
    this.player1.update(time, delta);
    if (this.player2) {
      this.player2.update(time, delta);
    }
    this.player1.setGrounded(false);
    if (this.player2) {
      this.player2.setGrounded(false);
    }

    this.checkBossTrigger();
    this.checkStageCompletion();
  }

  private checkBossTrigger(): void {
    if (this.bossTriggered || !this.player1.active) return;
    const p1 = this.player1.body as Phaser.Physics.Arcade.Body;
    if (p1 && p1.x > 7000) {
      this.bossTriggered = true;
      const checkpoint = { x: p1.x, y: p1.y };
      this.scene.start("boss", {
        stageId: "stage1",
        bossId: "stage1-boss",
        playerState: { playerCount: this.playerCount, checkpoint },
      });
    }
  }

  private checkStageCompletion(): void {
    if (this.bossTriggered) return;
    if (this.enemies.countActive(true) === 0) {
      this.bossTriggered = true;
      this.scene.start("boss", {
        stageId: "stage1",
        bossId: "stage1-boss",
        playerState: { playerCount: this.playerCount, checkpoint: { x: 100, y: 500 } },
      });
    }
  }
}