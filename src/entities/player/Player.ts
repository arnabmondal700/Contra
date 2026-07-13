// src/entities/player/Player.ts
import Phaser from "phaser";
import { BaseEntity } from "../BaseEntity";
import { StateMachine } from "../../core/StateMachine";
import { InputState } from "../../types/InputState";
import { IWeapon } from "../../types/IWeapon";
import { EventBus } from "../../core/EventBus";
import { PHYSICS_CONFIG } from "../../config/PhysicsConfig";
import {
  IdleState,
  RunState,
  JumpState,
  CrouchState,
  ProneState,
  ClimbState,
  HurtState,
  DeadState,
  RespawnState,
} from "./PlayerStates";

export class Player extends BaseEntity {
  private fsm: StateMachine<Player>;
  private inputState: InputState;
  private invincibilityTimer = 0;
  private readonly invincibilityDuration = 1500;
  private lives = 3;
  private currentWeapon: IWeapon | null = null;
  private facingRight = true;
  private isGrounded = false;
  private jumpBufferTimer = 0;
  private readonly jumpBufferDuration = 100;
  private coyoteTimer = 0;
  private readonly coyoteDuration = 100;
  private playerId: number;

  getCoyoteTimer(): number {
    return this.coyoteTimer;
  }

  setCoyoteTimer(value: number): void {
    this.coyoteTimer = value;
  }

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    playerId: number,
    inputState: InputState
  ) {
    const textureKey = scene.textures.exists("player") ? "player" : Player.createPlaceholderTexture(scene, `player-${playerId}`);

    super(scene, x, y, textureKey, 1);

    this.playerId = playerId;
    this.inputState = inputState;

    const body = this.body as Phaser.Physics.Arcade.Body;
    const standing = PHYSICS_CONFIG.player.standingBody;
    body.setSize(standing.width, standing.height);
    body.setOffset(standing.offsetX, standing.offsetY);
    body.setCollideWorldBounds(true);
    body.maxVelocity.set(200, 600);

    this.fsm = new StateMachine(this);
    this.setupStates();
    this.fsm.transition("idle");

    body.onWorldBounds = true;
    body.world.on(Phaser.Physics.Arcade.Events.WORLD_BOUNDS, (body: Phaser.Physics.Arcade.Body) => {
      if (body.gameObject === this && body.blocked.down) {
        this.isGrounded = true;
      }
    });
  }

  private setupStates(): void {
    this.fsm
      .addState("idle", new IdleState())
      .addState("run", new RunState())
      .addState("jump", new JumpState())
      .addState("crouch", new CrouchState())
      .addState("prone", new ProneState())
      .addState("climb", new ClimbState())
      .addState("hurt", new HurtState())
      .addState("dead", new DeadState())
      .addState("respawn", new RespawnState());
  }

  getPlayerId(): number {
    return this.playerId;
  }

  getInputState(): InputState {
    return this.inputState;
  }

  getFsm(): StateMachine<Player> {
    return this.fsm;
  }

  setWeapon(weapon: IWeapon): void {
    this.currentWeapon = weapon;
    EventBus.emit("WEAPON_CHANGED", { playerId: this.playerId, weaponId: weapon.id });
  }

  getWeapon(): IWeapon | null {
    return this.currentWeapon;
  }

  getLives(): number {
    return this.lives;
  }

  loseLife(): void {
    this.lives = Math.max(0, this.lives - 1);
    EventBus.emit("PLAYER_DIED", { playerId: this.playerId });
    EventBus.emit("LIVES_CHANGED", { playerId: this.playerId, lives: this.lives });
  }

  gainLife(): void {
    this.lives = Math.min(9, this.lives + 1);
    EventBus.emit("LIVES_CHANGED", { playerId: this.playerId, lives: this.lives });
  }

  isInvincible(): boolean {
    return this.invincibilityTimer > 0;
  }

  setInvincible(duration?: number): void {
    this.invincibilityTimer = duration ?? this.invincibilityDuration;
    this.setAlpha(0.5);
    this.scene.time.delayedCall(this.invincibilityTimer, () => {
      this.invincibilityTimer = 0;
      this.setAlpha(1);
    });
  }

  setFacingRight(right: boolean): void {
    this.facingRight = right;
    this.flipX = !right;
  }

  isFacingRight(): boolean {
    return this.facingRight;
  }

  setGrounded(grounded: boolean): void {
    this.isGrounded = grounded;

    if (grounded) {
      this.coyoteTimer = this.coyoteDuration;
    }
  }

  isOnGround(): boolean {
    return this.isGrounded;
  }

  canJump(): boolean {
    return this.isGrounded || this.coyoteTimer > 0;
  }

  bufferJump(): void {
    this.jumpBufferTimer = this.jumpBufferDuration;
  }

  consumeJumpBuffer(): boolean {
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer = 0;
      return true;
    }
    return false;
  }

  update(_time: number, delta: number): void {
    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer -= delta;
    }
    if (this.coyoteTimer > 0) {
      this.coyoteTimer -= delta;
    }
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= delta;
    }

    this.fsm.update(delta);
  }

  safePlay(key: string, ignoreIfPlaying?: boolean): void {
    if (!this.anims.exists(key)) return; // Only play if animation exists
    super.play(key, ignoreIfPlaying);
  }

  takeDamage(amount: number, source?: import("../../types/IEntity").IEntity): void {
    if (this.isInvincible() || this.fsm.state === "dead") return;
    super.takeDamage(amount, source);

    if (this.getHealth() <= 0) {
      this.fsm.transition("dead");
    } else {
      this.fsm.transition("hurt");
    }
  }

  private static createPlaceholderTexture(scene: Phaser.Scene, key: string): string {
    if (scene.textures.exists(key)) return key;

    const graphics = scene.make.graphics({ x: 0, y: 0 });
    graphics.fillStyle(0x00aaff, 1);
    graphics.fillRect(0, 0, 16, 32);
    graphics.fillStyle(0xffccaa, 1);
    graphics.fillRect(2, -4, 12, 12);
    graphics.fillStyle(0x333333, 1);
    graphics.fillRect(16, 8, 8, 4);

    graphics.generateTexture(key, 24, 32);
    graphics.destroy();
    return key;
  }
}