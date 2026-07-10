// src/ai/PatrolBehavior.ts
import { IAiBehavior } from "./IAiBehavior";
import { IEntity } from "../types/IEntity";

export class PatrolBehavior implements IAiBehavior {
  update(_enemy: IEntity, _player: IEntity, _delta: number): void {
    // Basic patrol logic will be implemented here
    // For now, this is a placeholder
  }
}
