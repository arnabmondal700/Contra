# Progress: Contra Clone

## Legend
- [ ] Not started  |  [~] In progress  |  [x] Complete

## Phase 0 -- Scaffolding
| Task | Status |
|---|---|
| Architecture document finalized | [x] |
| Agent usage guide | [x] |
| Memory Bank created | [x] |
| npm init + package.json | [x] |
| Install dependencies | [x] |
| tsconfig.json (strict) | [x] |
| vite.config.ts | [x] |
| src/main.ts (Phaser boot) | [x] |
| BootScene placeholder | [x] |
| PreloadScene placeholder | [x] |
| MainMenuScene placeholder | [x] |
| .github/workflows/deploy.yml | [x] |
| CI lint passes | [x] |
| Vite build succeeds | [x] |

## Phase 1 -- Core Movement
| Task | Status |
|---|---|
| Player entity with StateMachine | [ ] |
| Player states: Idle, Run, Jump, Crouch, Prone, Climb, Hurt, Dead, Respawn | [ ] |
| Test stage tilemap (Tiled) | [ ] |
| CameraSystem (follow, dead-zone, bounds) | [ ] |
| Input system (keyboard) | [ ] |

## Phase 2 -- Combat Basics
| Task | Status |
|---|---|
| MachineGun | [ ] |
| SoldierEnemy | [ ] |
| CollisionSystem | [ ] |
| DamageSystem | [ ] |
| ObjectPool (bullets) | [ ] |

## Phase 3 -- Full Roster
| Task | Status |
|---|---|
| SpreadGun, LaserGun, FireGun | [ ] |
| SniperEnemy, TurretEnemy, AlienEnemy | [ ] |
| EnemyFactory | [ ] |
| Pickup system | [ ] |

## Phase 4 -- Boss + Stage Loop
| Task | Status |
|---|---|
| Boss abstract class | [ ] |
| Stage1Boss | [ ] |
| StageScene complete | [ ] |
| BossScene | [ ] |
| VictoryScene | [ ] |
| GameOverScene | [ ] |
| Checkpoint/save system | [ ] |
| Stage 1 fully playable | [ ] |

## Phase 5 -- Two-Player Co-op
| Task | Status |
|---|---|
| P2 input mapping | [ ] |
| Shared-screen camera | [ ] |
| Lives pool decision resolved | [ ] |

## Phase 6 -- Content Scale-Up
| Task | Status |
|---|---|
| Stages 2-8 | [ ] |
| Bosses 2-8 | [ ] |
| Difficulty curve reviewed | [ ] |

## Phase 7 -- Mobile + Polish
| Task | Status |
|---|---|
| Touch controls | [ ] |
| Gamepad remapping | [ ] |
| Performance pass | [ ] |
| Audio final pass | [ ] |

## Release Goals
- [ ] Full 8 stages, each with a boss
- [ ] Local two-player support
- [ ] Gamepad support alongside keyboard
- [ ] 60 FPS desktop / 30 FPS mobile
- [ ] Touch controls included
- [ ] Save/checkpoint system
- [ ] CI pipeline gating deploys

## Open Questions
1. Shared vs. per-player lives pool?
2. Weapon pickups: replace-current vs. stockpile?
3. Mobile touch: v1 requirement or Phase 7?