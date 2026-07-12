// src/entities/player/PlayerStates.ts
import Phaser from "phaser";
import { IState } from "../../core/StateMachine";
import { Player } from "./Player";
import { PHYSICS_CONFIG } from "../../config/PhysicsConfig";

const JUMP_VELOCITY = PHYSICS_CONFIG.player.jumpVelocity;
const SPEED = PHYSICS_CONFIG.player.speed;
const CROUCH_SPEED = PHYSICS_CONFIG.player.crouchSpeed;
const PRONE_SPEED = PHYSICS_CONFIG.player.proneSpeed;
const MAX_FALL_SPEED = PHYSICS_CONFIG.player.maxFallSpeed;

export class IdleState implements IState<Player> {
  enter(player: Player): void {
    const body = player.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(0);
    player.safePlay("player-idle", true);
  }

  execute(player: Player, _delta: number): void {
    const input = player.getInputState();

    if (input.left || input.right) {
      player.getFsm().transition("run");
      return;
    }

    if (input.down && !input.up) {
      player.getFsm().transition("crouch");
      return;
    }

    if (input.jump && player.canJump()) {
      player.getFsm().transition("jump");
      return;
    }

    if (input.jump) {
      player.bufferJump();
    }

    if (!player.isOnGround() && player.getCoyoteTimer() <= 0) {
      player.getFsm().transition("jump");
    }
  }

  exit(_player: Player): void {}
}

export class RunState implements IState<Player> {
  enter(player: Player): void {
    player.safePlay("player-run", true);
  }

  execute(player: Player, _delta: number): void {
    const input = player.getInputState();
    const body = player.body as Phaser.Physics.Arcade.Body;

    if (input.left && !input.right) {
      body.setVelocityX(-SPEED);
      player.setFacingRight(false);
    } else if (input.right && !input.left) {
      body.setVelocityX(SPEED);
      player.setFacingRight(true);
    } else {
      player.getFsm().transition("idle");
      return;
    }

    if (input.down && !input.up) {
      player.getFsm().transition("crouch");
      return;
    }

    if (input.jump && player.canJump()) {
      player.getFsm().transition("jump");
      return;
    }

    if (input.jump) {
      player.bufferJump();
    }

    if (!player.isOnGround() && player.getCoyoteTimer() <= 0) {
      player.getFsm().transition("jump");
    }
  }

  exit(_player: Player): void {
    const body = _player.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(0);
  }
}

export class JumpState implements IState<Player> {
  private hasJumped = false;

  enter(player: Player): void {
    this.hasJumped = false;
    const body = player.body as Phaser.Physics.Arcade.Body;

    if (player.isOnGround() || player.getCoyoteTimer() > 0) {
      body.setVelocityY(JUMP_VELOCITY);
      this.hasJumped = true;
      player.consumeJumpBuffer();
      player.setGrounded(false);
      player.safePlay("player-jump-rise", true);
    } else {
      player.safePlay("player-jump-fall", true);
    }
  }

  execute(player: Player, _delta: number): void {
    const input = player.getInputState();
    const body = player.body as Phaser.Physics.Arcade.Body;

    if (input.left && !input.right) {
      body.setVelocityX(-SPEED);
      player.setFacingRight(false);
    } else if (input.right && !input.left) {
      body.setVelocityX(SPEED);
      player.setFacingRight(true);
    }

    if (this.hasJumped && !input.jump && body.velocity.y < 0) {
      body.setVelocityY(body.velocity.y * 0.5);
      this.hasJumped = false;
    }

    if (body.velocity.y > 0) {
      player.safePlay("player-jump-fall", true);
    }

    if (player.isOnGround() && body.velocity.y >= 0) {
      player.safePlay("player-jump-land", true);
      player.scene.time.delayedCall(100, () => {
        if (player.getFsm().state === "jump") {
          if (input.left || input.right) {
            player.getFsm().transition("run");
          } else if (input.down) {
            player.getFsm().transition("crouch");
          } else {
            player.getFsm().transition("idle");
          }
        }
      });
      return;
    }

    if (input.down && !input.up && body.velocity.y > 0) {
      player.getFsm().transition("prone");
    }

    if (body.velocity.y > MAX_FALL_SPEED) {
      body.setVelocityY(MAX_FALL_SPEED);
    }
  }

  exit(_player: Player): void {}
}

export class CrouchState implements IState<Player> {
  enter(player: Player): void {
    const body = player.body as Phaser.Physics.Arcade.Body;
    body.setSize(16, 16);
    body.setOffset(0, 16);
    body.setVelocityX(0);
    player.safePlay("player-crouch-idle", true);
  }

  execute(player: Player, _delta: number): void {
    const input = player.getInputState();
    const body = player.body as Phaser.Physics.Arcade.Body;

    if (!input.down || input.up) {
      body.setSize(PHYSICS_CONFIG.player.standingBody.width, PHYSICS_CONFIG.player.standingBody.height);
      body.setOffset(PHYSICS_CONFIG.player.standingBody.offsetX, PHYSICS_CONFIG.player.standingBody.offsetY);
      if (input.left || input.right) {
        player.getFsm().transition("run");
      } else {
        player.getFsm().transition("idle");
      }
      return;
    }

    if (input.jump && player.canJump()) {
      body.setSize(PHYSICS_CONFIG.player.standingBody.width, PHYSICS_CONFIG.player.standingBody.height);
      body.setOffset(PHYSICS_CONFIG.player.standingBody.offsetX, PHYSICS_CONFIG.player.standingBody.offsetY);
      player.getFsm().transition("jump");
      return;
    }

    const wasMoving = body.velocity.x !== 0;
    if (input.left && !input.right) {
      body.setVelocityX(-CROUCH_SPEED);
      player.setFacingRight(false);
    } else if (input.right && !input.left) {
      body.setVelocityX(CROUCH_SPEED);
      player.setFacingRight(true);
    } else {
      body.setVelocityX(0);
    }

    const isMoving = body.velocity.x !== 0;
    if (isMoving && !wasMoving) {
      player.safePlay("player-crouch-move", true);
    } else if (!isMoving && wasMoving) {
      player.safePlay("player-crouch-idle", true);
    }
  }

  exit(_player: Player): void {
    const body = _player.body as Phaser.Physics.Arcade.Body;
    body.setSize(PHYSICS_CONFIG.player.standingBody.width, PHYSICS_CONFIG.player.standingBody.height);
    body.setOffset(PHYSICS_CONFIG.player.standingBody.offsetX, PHYSICS_CONFIG.player.standingBody.offsetY);
  }
}

export class ProneState implements IState<Player> {
  enter(player: Player): void {
    const body = player.body as Phaser.Physics.Arcade.Body;
    body.setSize(32, 8);
    body.setOffset(-8, 24);
    body.setVelocityX(0);
    player.safePlay("player-prone", true);
  }

  execute(player: Player, _delta: number): void {
    const input = player.getInputState();
    const body = player.body as Phaser.Physics.Arcade.Body;

    if (!input.down || input.up) {
      body.setSize(PHYSICS_CONFIG.player.standingBody.width, PHYSICS_CONFIG.player.standingBody.height);
      body.setOffset(PHYSICS_CONFIG.player.standingBody.offsetX, PHYSICS_CONFIG.player.standingBody.offsetY);
      if (input.left || input.right) {
        player.getFsm().transition("run");
      } else {
        player.getFsm().transition("idle");
      }
      return;
    }

    if (input.left && !input.right) {
      body.setVelocityX(-PRONE_SPEED);
      player.setFacingRight(false);
    } else if (input.right && !input.left) {
      body.setVelocityX(PRONE_SPEED);
      player.setFacingRight(true);
    } else {
      body.setVelocityX(0);
    }
  }

  exit(player: Player): void {
    const body = player.body as Phaser.Physics.Arcade.Body;
    body.setSize(PHYSICS_CONFIG.player.standingBody.width, PHYSICS_CONFIG.player.standingBody.height);
    body.setOffset(PHYSICS_CONFIG.player.standingBody.offsetX, PHYSICS_CONFIG.player.standingBody.offsetY);
  }
}

export class ClimbState implements IState<Player> {
  enter(player: Player): void {
    const body = player.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(0);
    body.setVelocityY(0);
    body.setAllowGravity(false);
    player.safePlay("player-climb", true);
  }

  execute(player: Player, _delta: number): void {
    const input = player.getInputState();
    const body = player.body as Phaser.Physics.Arcade.Body;
    const climbSpeed = PHYSICS_CONFIG.player.climbSpeed;

    if (input.up) {
      body.setVelocityY(-climbSpeed);
    } else if (input.down) {
      body.setVelocityY(climbSpeed);
    } else {
      body.setVelocityY(0);
    }

    if (input.jump) {
      body.setAllowGravity(true);
      player.getFsm().transition("jump");
    }
  }

  exit(player: Player): void {
    const body = player.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(true);
  }
}

export class HurtState implements IState<Player> {
  private timer = 0;
  private readonly duration = 500;

  enter(player: Player): void {
    this.timer = this.duration;
    const body = player.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(0);
    body.setVelocityY(JUMP_VELOCITY * 0.5);
    player.setInvincible();
    player.safePlay("player-hurt", true);
  }

  execute(player: Player, _delta: number): void {
    this.timer -= _delta;

    if (this.timer <= 0) {
      if (player.isOnGround()) {
        const input = player.getInputState();
        if (input.left || input.right) {
          player.getFsm().transition("run");
        } else if (input.down) {
          player.getFsm().transition("crouch");
        } else {
          player.getFsm().transition("idle");
        }
      } else {
        player.getFsm().transition("jump");
      }
    }
  }

  exit(_player: Player): void {}
}

export class DeadState implements IState<Player> {
  enter(player: Player): void {
    const body = player.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(0);
    body.setVelocityY(0);
    body.setAllowGravity(false);
    body.enable = false;
    player.setVisible(false);
    player.setActive(false);
    player.loseLife();
  }

  execute(_player: Player, _delta: number): void {}

  exit(player: Player): void {
    const body = player.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setAllowGravity(true);
    player.setVisible(true);
    player.setActive(true);
  }
}

export class RespawnState implements IState<Player> {
  private timer = 0;
  private readonly invincibilityTime = 3000;

  enter(player: Player): void {
    this.timer = this.invincibilityTime;
    player.setInvincible(this.invincibilityTime);
    player.setAlpha(0.5);

    if (player.isOnGround()) {
      const input = player.getInputState();
      if (input.left || input.right) {
        player.getFsm().transition("run");
      } else if (input.down) {
        player.getFsm().transition("crouch");
      } else {
        player.getFsm().transition("idle");
      }
    } else {
      player.getFsm().transition("jump");
    }
  }

  execute(player: Player, _delta: number): void {
    this.timer -= _delta;
    if (this.timer <= 0) {
      player.setAlpha(1);
    }
  }

  exit(_player: Player): void {}
}