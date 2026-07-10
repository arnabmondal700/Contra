// src/entities/boss/BossFactory.ts
import { Boss } from "./Boss";
import { Stage1Boss } from "./Stage1Boss";
import { Stage2Boss } from "./Stage2Boss";
import { Stage3Boss } from "./Stage3Boss";
import { Stage4Boss } from "./Stage4Boss";
import { Stage5Boss } from "./Stage5Boss";
import { Stage6Boss } from "./Stage6Boss";
import { Stage7Boss } from "./Stage7Boss";
import { Stage8Boss } from "./Stage8Boss";

type BossConstructor = new (scene: Phaser.Scene, x: number, y: number) => Boss;

const registry: Record<string, BossConstructor> = {
  "stage1-boss": Stage1Boss,
  "stage2-boss": Stage2Boss,
  "stage3-boss": Stage3Boss,
  "stage4-boss": Stage4Boss,
  "stage5-boss": Stage5Boss,
  "stage6-boss": Stage6Boss,
  "stage7-boss": Stage7Boss,
  "stage8-boss": Stage8Boss,
};

export class BossFactory {
  static create(bossId: string, scene: Phaser.Scene, x: number, y: number): Boss {
    const Ctor = registry[bossId];
    if (!Ctor) {
      throw new Error(`Unknown boss ID: ${bossId}`);
    }
    return new Ctor(scene, x, y);
  }
}