// src/ai/IAiBehavior.ts
import { IEntity } from "../types/IEntity";

export interface IAiBehavior {
  update(
    enemy: IEntity,
    player: IEntity,
    delta: number
  ): void;
}