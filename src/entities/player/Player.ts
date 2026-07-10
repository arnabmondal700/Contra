// src/entities/player/Player.ts
import Phaser from "phaser";
import { BaseEntity } from "../BaseEntity";
import { StateMachine } from "../../core/StateMachine";
import { InputState } from "../../types/InputState";
import { IWeapon } from "../../types/IWeapon";
import { EventBus } from "../../core/EventBus";
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
  // private wasGrounded = false; // unused
  private jumpBufferTimer = 0;
  private readonly jumpBufferDuration = 100;
  private coyoteTimer = 0;
  private readonly coyoteDuration = 100;

  getCoyoteTimer(): number {
    return this.coyoteTimer;
  }

  setCoyoteTimer(value: number): void {
    this.coyoteTimer = value;
  }
  private playerId: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    playerId: number,
    inputState: InputState
  ) {
    // Create a placeholder texture if none exists
    const texture = Player.createPlaceholderTexture(scene, `player-${playerId}`);
    
    super(scene, x, y, texture, 1);
    
    this.playerId = playerId;
    this.inputState = inputState;
    
    // Physics body setup
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(16, 32);
    body.setOffset(0, 0);
    body.setCollideWorldBounds(true);
    body.maxVelocity.set(200, 600);
    
    // State machine setup
    this.fsm = new StateMachine(this);
    this.setupStates();
    this.fsm.transition("idle");
    
    // Listen for ground collision via world bounds
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
    // Update timers
    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer -= delta;
    }
    if (this.coyoteTimer > 0) {
      this.coyoteTimer -= delta;
    }
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= delta;
    }
    
    // Update state machine
    this.fsm.update(delta);
    
    // Apply horizontal velocity based on input
    this.handleMovement(delta);
  }

  private handleMovement(_delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const speed = 180; // PHYSICS_CONFIG.player.speed
    
    if (this.inputState.left && !this.inputState.right) {
      body.setVelocityX(-speed);
      this.setFacingRight(false);
    } else if (this.inputState.right && !this.inputState.left) {
      body.setVelocityX(speed);
      this.setFacingRight(true);
    } else {
      // No horizontal input - apply friction/stop
      body.setVelocityX(0);
    }
  }

  private static createPlaceholderTexture(scene: Phaser.Scene, key: string): string {
    if (scene.textures.exists(key)) return key;
    
    const graphics = scene.make.graphics({ x: 0, y: 0 });
    // Body
    graphics.fillStyle(0x00aaff, 1);
    graphics.fillRect(0, 0, 16, 32);
    // Head
    graphics.fillStyle(0xffccaa, 1);
    graphics.fillRect(2, -4, 12, 12);
    // Gun
    graphics.fillStyle(0x333333, 1);
    graphics.fillRect(16, 8, 8, 4);
    
    graphics.generateTexture(key, 24, 32);
    graphics.destroy();
    return key;
  }
}
