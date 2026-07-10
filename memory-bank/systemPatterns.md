# System Patterns: Contra Clone

## Architecture Layers
```
Input Layer -> Scene Layer -> Entity Layer -> Gameplay Systems -> Managers -> Phaser Core
                              <-> Event Bus (cross-layer)
```

## Dependency Rules
1. Systems depend on Entities and Managers. Entities never import Scenes or Systems directly.
2. Managers are singletons via ServiceLocator, registered in BootScene.
3. Event Bus is the only cross-layer dependency -- decouples Systems from UI/HUD.

## Design Patterns

### Service Locator (core/ServiceLocator.ts)
Static registry for manager singletons. Enables mock injection in tests.

### State Machine (core/StateMachine.ts)
Generic FSM for Player, Enemy, and Boss state logic.
- Player: Idle, Run, Jump, Crouch, Prone, Climb, Hurt, Dead, Respawn
- Enemy: Patrol, Alert, Attack, Hurt, Dead
- Boss: Phase1, Phase2, Phase3, Enrage, Dead

### Observer / Event Bus (core/EventBus.ts)
Typed event emitter. Scenes must unregister in shutdown to prevent duplicate handlers.

### Object Pool (core/ObjectPool.ts)
Reuses bullets, explosions, particles. Initial pool of 20.

### Factory (EnemyFactory.ts)
Maps type strings to constructors via Registry. New enemy = one registry line.

### Strategy
- Weapons: IWeaponStrategy -> SpreadGun, LaserGun, FireGun, MachineGun
- AI: IAiBehavior -> PatrolBehavior, ChaseBehavior, TurretBehavior

## Scene Flow
```
Boot -> Preload -> MainMenu -> Stage -> Boss -> Victory/GameOver
                    ^                        |
                    +-------- GameOver <-----+
HudScene runs parallel via scene.launch
```

## Entity Hierarchy
```
BaseEntity (Phaser.Physics.Arcade.Sprite, implements IEntity)
|-- Player (StateMachine, WeaponSystem, i-frames, lives)
|-- Enemy (abstract: IAiBehavior + StateMachine)
|   |-- SoldierEnemy, SniperEnemy, TurretEnemy, AlienEnemy
|-- Boss (abstract: multi-phase StateMachine, phaseThresholds)
|   |-- Stage1Boss, Stage2Boss...
|-- Pickup (overlap-triggered effect, 8s despawn)
|-- Projectile (pooled, owner tracking for kill attribution)
```

## Systems
| System | Key Responsibility |
|---|---|
| CollisionSystem | Register all Arcade Physics groups and overlap/collider callbacks |
| SpawnSystem | Read stage spawn tables, trigger spawns, enforce max 12 enemy cap |
| WeaponSystem | Manage active weapon, route fire input, track cooldown |
| DamageSystem | Central hit resolution, i-frames, knockback |
| CameraSystem | Follow dead-zone, level bounds clamp, screen shake, boss-arena lock |

## Managers
| Manager | Responsibility |
|---|---|
| AssetManager | Wraps Phaser loader with asset manifest |
| AudioManager | Music/SFX channels, volume ducking |
| SaveManager | localStorage persistence, versioned migration |
| SceneManager | Thin wrapper for consistent fade transitions |

## Collision Matrix
All pairs registered in one CollisionSystem.setupColliders() call.