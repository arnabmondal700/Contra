# Progress

## Phase 1 — Core Movement
- ✅ Boot/Preload/MainMenu scenes wired
- ✅ TypeScript config with strict mode
- ✅ InputState + InputSystem (keyboard + gamepad)
- ✅ PhysicsConfig + InputConfig
- ✅ BaseEntity abstract class
- ✅ Player with StateMachine (9 states)
- ✅ PlayerStates implementations
- ✅ CameraSystem (single/multi-player follow, dead-zone, boss arena lock, shake)
- ✅ StageScene with procedural test level (8000px)

## Phase 2 — Combat Basics
- ✅ Projectile entity with pool-aware lifetime
- ✅ ObjectPool implementation
- ✅ MachineGun weapon (120ms fire rate, pooled bullets)
- ✅ Enemy base class with activate/deactivate, StateMachine hooks
- ✅ SoldierEnemy (3HP, patrol bounds, alert/attack ranges, cooldowns)
- ✅ CollisionSystem (bullet↔enemy, bullet↔player, terrain)
- ✅ WeaponSystem (routes fire input with owner/direction)
- ✅ StageScene combat integration + runtime order fix

## Phase 3 — Full Roster ✅ COMPLETE
- ✅ SpreadGun (5-way fan, 250ms)
- ✅ LaserGun (fast piercing, 350ms)
- ✅ FireGun (high damage slower, 400ms)
- ✅ SniperEnemy (2HP, 150 score, aim delay)
- ✅ TurretEnemy (4HP, 200 score, facing logic)
- ✅ AlienEnemy (3HP, 120 score, floating movement)
- ✅ EnemyFactory (registry with factory functions)
- ✅ Pickup system (weapon replacement, 8s lifetime)
- ✅ PickupFactory (weighted random spawns)
- ✅ StageScene wired with all weapons, all enemies, pickups

## Phase 4 — Boss + Stage Loop ✅ COMPLETE
- ✅ SaveManager (localStorage-backed score persistence, versioned schema)
- ✅ Boss abstract entity (phase thresholds, score value, phase transitions)
- ✅ Stage1Boss (200HP, 3 phases, jump/attack timers)
- ✅ StageScene boss trigger and stage completion detection
- ✅ BossScene (arena setup, collisions, camera, player death/boss defeat flow)
- ✅ VictoryScene (high score persistence, stage unlock)
- ✅ GameOverScene (checkpoint retry)
- ✅ HudScene (score, lives, boss health bar driven by EventBus)
- ✅ Build + lint pass

## Phase 5 — Two-Player Co-op ✅ COMPLETE
- ✅ InputSystem P2 keyboard + gamepad support
- ✅ BossScene wires P2 input through InputSystem
- ✅ GameOverScene preserves playerCount through retry
- ✅ StageScene game-over handling when all players lose lives
- ✅ HudScene per-player lives display (P1/P2)
- ✅ Player emits LIVES_CHANGED for HUD sync
- ✅ Build + lint pass
