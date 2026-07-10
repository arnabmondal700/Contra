export type EventMap = {
  PLAYER_DIED: { playerId: number };
  PLAYER_RESPAWN: { playerId: number; position: { x: number; y: number } };
  ENEMY_KILLED: { enemyId: string; scoreValue: number; position: { x: number; y: number } };
  BOSS_DEFEATED: { bossId: string; stageId: string };
  STAGE_COMPLETED: { stageId: string; score: number; timeMs: number };
  WEAPON_CHANGED: { playerId: number; weaponId: string };
  GAME_PAUSED: { paused: boolean };
  ENTITY_DAMAGED: { entity: unknown; amount: number; source?: unknown };
  ENTITY_DIED: { entity: unknown };
  SCORE_CHANGED: { score: number };
  LIVES_CHANGED: { playerId: number; lives: number };
};