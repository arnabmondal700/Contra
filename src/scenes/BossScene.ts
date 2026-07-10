// scenes/BossScene.ts
import Phaser from "phaser";
import { Boss } from "../entities/boss/Boss";
import { BossFactory } from "../entities/boss/BossFactory";
import { CollisionSystem } from "../systems/CollisionSystem";
import { CameraSystem } from "../systems/CameraSystem";
import { WeaponSystem } from "../systems/WeaponSystem";
import { InputSystem } from "../systems/InputSystem";
import { Player } from "../entities/player/Player";
import { EventBus } from "../core/EventBus";
import { getStageConfig } from "../data/StageData";

export class BossScene extends Phaser.Scene {
  private collisionSystem!: CollisionSystem;
  private cameraSystem!: CameraSystem;
  private weaponSystem!: WeaponSystem;
  private inputSystem!: InputSystem;
  private boss!: Boss;
  private players: Player[] = [];
  private bullets!: Phaser.Physics.Arcade.Group;
  private bossBullets!: Phaser.Physics.Arcade.Group;
  private arenaBounds!: Phaser.Physics.Arcade.StaticGroup;
  private playerCount = 1;
  private stageId = "stage1";
  private bossId = "stage1-boss";
  private checkpoint?: { x: number; y: number };

  constructor() {
    super({ key: "boss" });
  }

  init(data: { stageId: string; bossId: string; playerState: { playerCount?: number; checkpoint?: { x: number; y: number } } }): void {
    this.stageId = data.stageId;
    this.bossId = data.bossId;
    this.playerCount = data.playerState?.playerCount ?? 1;
    this.checkpoint = data.playerState?.checkpoint;
    console.log(`[BossScene] Starting ${data.bossId} for ${data.stageId}`);
  }

  create(): void {
    const { width, height } = this.cameras.main;

    // Get stage config for theme
    const stageConfig = getStageConfig(this.stageId);

    // Boss arena background
    this.add.rectangle(width / 2, height / 2, width, height, stageConfig?.theme.skyColor ?? 0x1a1a1a);

    // Arena borders (visual)
    this.add.rectangle(width / 2, 8, width, 16, 0x444444);
    this.add.rectangle(width / 2, height - 8, width, 16, 0x444444);

    // Ground for boss arena
    this.arenaBounds = this.physics.add.staticGroup();
    const ground = this.arenaBounds.create(width / 2, height - 16, undefined);
    ground.setDisplaySize(width, 32);
    ground.refreshBody();

    // Initialize systems
    this.collisionSystem = new CollisionSystem(this);
    this.cameraSystem = new CameraSystem(this);
    this.weaponSystem = new WeaponSystem(this);
    this.inputSystem = new InputSystem(this);

    // Spawn players from scene registry or default positions
    this.spawnPlayers();

    // Spawn boss using factory
    const bossSpawn = stageConfig?.bossSpawn ?? { x: width / 2, y: 100 };
    this.boss = BossFactory.create(this.bossId, this, bossSpawn.x, bossSpawn.y);

    // Create bullet groups
    this.bullets = this.physics.add.group({ defaultKey: "machinegun_bullet", maxSize: 60, runChildUpdate: true });
    this.bossBullets = this.physics.add.group({ defaultKey: "machinegun_bullet", maxSize: 30, runChildUpdate: true });

    // Set up collisions
    this.collisionSystem.registerBulletPlayerCollisions(this.bossBullets, this.players[0]);
    if (this.players[1]) {
      this.collisionSystem.registerBulletPlayerCollisions(this.bossBullets, this.players[1]);
    }

    // Player terrain collision
    for (const player of this.players) {
      this.physics.add.collider(player, this.arenaBounds, () => player.setGrounded(true));
    }

    // Bullet vs terrain
    this.collisionSystem.registerTerrainCollisions(this.bullets, this.arenaBounds);
    this.collisionSystem.registerTerrainCollisions(this.bossBullets, this.arenaBounds);

    // Register boss collision with player bullets directly
    this.physics.add.overlap(
      this.bullets,
      this.boss,
      (bulletObj, _bossObj) => {
        const bullet = bulletObj as Phaser.Physics.Arcade.Sprite;
        if (bullet.active) {
          this.boss.takeDamage(1);
          bullet.destroy();
        }
      }
    );

    // Camera follow
    this.cameraSystem.setLevelBounds(new Phaser.Geom.Rectangle(0, 0, width, height));
    this.cameraSystem.setPlayers(this.players);
    this.cameraSystem.update();

    // Launch HUD overlay
    this.scene.launch("hud", { playerCount: this.playerCount });

    // Listen for boss defeat
    EventBus.on("BOSS_DEFEATED", () => {
      this.time.delayedCall(1000, () => {
        const score = (this.players[0]?.getLives() ?? 0) * 1000; // placeholder score calc
        this.scene.start("victory", { score, stageId: this.stageId });
      });
    });

    // Listen for player death
    EventBus.on("PLAYER_DIED", (payload: { playerId: number }) => {
      const player = this.players.find((p) => p.getPlayerId() === payload.playerId);
      if (player) {
        player.setActive(false);
        player.setVisible(false);
      }
      const alive = this.players.filter((p) => p.active);
      if (alive.length === 0) {
        this.time.delayedCall(1500, () => {
          this.scene.start("gameover", {
            score: 0,
            stageId: this.stageId,
            playerCount: this.playerCount,
            checkpoint: this.checkpoint,
          });
        });
      }
    });

    // Pause
    this.input.keyboard!.on("keydown-ESC", () => {
      this.scene.pause();
      this.scene.launch("pause", { previousScene: "boss" });
    });
  }

  private spawnPlayers(): void {
    const { width, height } = this.cameras.main;
    const startX = width / 4;
    const startY = height - 64;

    this.players[0] = new Player(this, startX, startY, 1, this.inputSystem.getPlayer1Input());
    this.weaponSystem.handleInput(this.players[0]);

    if (this.playerCount === 2) {
      this.players[1] = new Player(this, startX + 64, startY, 2, this.inputSystem.getPlayer2Input());
      this.weaponSystem.handleInput(this.players[1]);
    }
  }

  update(time: number, delta: number): void {
    for (const player of this.players) {
      player.update(time, delta);
    }
    if (this.boss.active) {
      this.boss.update(time, delta);
    }
  }
}