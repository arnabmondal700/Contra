// entities/boss/Boss.ts
import Phaser from "phaser";
import { BaseEntity } from "../BaseEntity";
import { StateMachine } from "../../core/StateMachine";
import { EventBus } from "../../core/EventBus";

export interface BossConfig {
  readonly id: string;
  readonly maxHealth: number;
  readonly scoreValue: number;
  readonly phaseThresholds: number[];
}

export abstract class Boss extends BaseEntity {
  protected readonly id: string;
  protected readonly scoreValue: number;
  protected readonly phaseThresholds: number[];
  protected fsm!: StateMachine<Boss>;
  private phaseIndex = 0;
  private stageId = "stage1";

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config: BossConfig
  ) {
    super(scene, x, y, texture, config.maxHealth);
    this.id = config.id;
    this.scoreValue = config.scoreValue;
    this.phaseThresholds = config.phaseThresholds;
  }

  setStageId(stageId: string): void {
    this.stageId = stageId;
  }

  protected die(): void {
    if (this.isDead) return;
    this.isDead = true;
    EventBus.emit("BOSS_DEFEATED", { bossId: this.id, stageId: this.stageId });
    EventBus.emit("ENTITY_DIED", { entity: this });
  }

  takeDamage(amount: number, source?: import("../../types/IEntity").IEntity): void {
    super.takeDamage(amount, source);
    this.updatePhase();
  }

  private updatePhase(): void {
    const pct = this.health / this.maxHealth;
    for (let i = this.phaseThresholds.length - 1; i >= 0; i--) {
      if (pct <= this.phaseThresholds[i]) {
        this.phaseIndex = i + 1;
        break;
      }
    }
    if (this.health === 0 && !this.isDead) {
      this.die();
    }
  }

  getPhase(): number {
    return this.phaseIndex;
  }

  getScoreValue(): number {
    return this.scoreValue;
  }

  abstract update(time: number, delta: number): void;
}