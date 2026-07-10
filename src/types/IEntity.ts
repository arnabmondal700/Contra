// src/types/IEntity.ts
export interface IEntity {
  update(time: number, delta: number): void;
  destroy(): void;
  takeDamage(amount: number, source?: IEntity): void;
  isAlive(): boolean;
}