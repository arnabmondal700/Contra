# Contra Clone — Technical Architecture Document (v2)

> Expanded from the original architecture outline into an implementation-ready spec: concrete TypeScript interfaces, class code, folder tree, data schemas, and a phased build plan. Assumed stack — call this out if it differs from your actual setup: **Phaser 3.9x, TypeScript 5.x (strict mode), Vite, Vitest + Playwright, deployed to Cloudflare Pages via GitHub Actions** (matches your existing Cloudflare Pages deployment pattern on other projects).

---

## 0. Scope & Assumptions

- Target: 2D side-scrolling run-and-gun, 8 stages, boss per stage, desktop + mobile browser, local two-player co-op.
- Rendering: Phaser 3 Arcade Physics (not Matter — Arcade is sufficient for run-and-gun collision needs and is much cheaper on mobile).
- Networked multiplayer and rollback netcode are explicitly out of scope for v1 (see §13.4) — flagged as a future phase, not designed in detail here, since it's a large enough effort to warrant its own spec once v1 ships.
- Where the original doc left a decision open (e.g. shared vs. per-player lives), this doc calls it out explicitly rather than silently picking one, so you can confirm before implementation.

---

## 1. High-Level Architecture

```text
┌──────────────────────────────────────────────────────────┐
│  Input Layer        keyboard / gamepad / touch → InputState│
├──────────────────────────────────────────────────────────┤
│  Scene Layer         Boot → Preload → MainMenu → Stage →   │
│                       Boss → Victory / GameOver            │
├──────────────────────────────────────────────────────────┤
│  Entity Layer         Player, Enemy, Boss, Pickup,          │
│                       Projectile (BaseEntity tree)          │
├──────────────────────────────────────────────────────────┤
│  Gameplay Systems      Collision · Spawn · Weapon · Damage ·│
│                        Camera                               │
├──────────────────────────┬─────────────────────────────────┤
│  Managers (singletons)    │  Asset · Audio · Save · Scene    │
├──────────────────────────┴─────────────────────────────────┤
│  Rendering & Audio (Phaser core: WebGL/Canvas, WebAudio)     │
└──────────────────────────────────────────────────────────┘

        Event Bus (Observer) cuts across every layer ↕
```

**Dependency rules** (the part the original diagram left implicit):

- Systems depend on Entities and Managers. Entities never import Scenes or Systems directly — they emit events and expose public methods; Systems call into them.
- Managers are singletons instantiated once in `BootScene` and accessed through a small `ServiceLocator`, not imported as ad-hoc globals. This keeps them mockable in unit tests.
- The Event Bus is the only thing every layer is allowed to depend on directly — it's the decoupling seam between, e.g., a `DamageSystem` resolving a hit and a `HudScene` updating a health bar, with neither knowing the other exists.

```typescript
// core/ServiceLocator.ts
export class ServiceLocator {
  private static services = new Map<string, unknown>();

  static register<T>(key: string, instance: T): void {
    this.services.set(key, instance);
  }

  static get<T>(key: string): T {
    const svc = this.services.get(key);
    if (!svc) throw new Error(`Service not registered: ${key}`);
    return svc as T;
  }
}
```

---

## 2. Project Folder Structure

```text
contra-clone/
├── public/
│   └── assets/
│       ├── atlases/
│       ├── audio/
│       ├── tilemaps/
│       └── fonts/
├── src/
│   ├── main.ts
│   ├── config/
│   │   ├── GameConfig.ts
│   │   ├── PhysicsConfig.ts
│   │   └── InputConfig.ts
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── PreloadScene.ts
│   │   ├── MainMenuScene.ts
│   │   ├── StageScene.ts
│   │   ├── BossScene.ts
│   │   ├── VictoryScene.ts
│   │   ├── GameOverScene.ts
│   │   └── HudScene.ts
│   ├── entities/
│   │   ├── BaseEntity.ts
│   │   ├── player/
│   │   │   ├── Player.ts
│   │   │   └── PlayerStates.ts
│   │   ├── enemies/
│   │   │   ├── Enemy.ts
│   │   │   ├── SoldierEnemy.ts
│   │   │   ├── SniperEnemy.ts
│   │   │   ├── TurretEnemy.ts
│   │   │   └── AlienEnemy.ts
│   │   ├── boss/
│   │   │   ├── Boss.ts
│   │   │   └── bosses/Stage1Boss.ts
│   │   ├── pickups/Pickup.ts
│   │   └── projectiles/Projectile.ts
│   ├── systems/
│   │   ├── CollisionSystem.ts
│   │   ├── SpawnSystem.ts
│   │   ├── WeaponSystem.ts
│   │   ├── DamageSystem.ts
│   │   └── CameraSystem.ts
│   ├── managers/
│   │   ├── AssetManager.ts
│   │   ├── AudioManager.ts
│   │   ├── SaveManager.ts
│   │   └── SceneManager.ts
│   ├── core/
│   │   ├── EventBus.ts
│   │   ├── StateMachine.ts
│   │   ├── ObjectPool.ts
│   │   └── ServiceLocator.ts
│   ├── weapons/
│   │   ├── IWeaponStrategy.ts
│   │   ├── SpreadGun.ts
│   │   ├── LaserGun.ts
│   │   ├── FireGun.ts
│   │   └── MachineGun.ts
│   ├── ai/
│   │   ├── IAiBehavior.ts
│   │   ├── PatrolBehavior.ts
│   │   ├── ChaseBehavior.ts
│   │   └── TurretBehavior.ts
│   ├── ui/
│   │   ├── Hud.ts
│   │   ├── LivesDisplay.ts
│   │   └── BossHealthBar.ts
│   ├── data/
│   │   ├── stages/stage1.json
│   │   ├── enemies.json
│   │   └── weapons.json
│   └── types/
│       ├── IEntity.ts
│       ├── IWeapon.ts
│       ├── IState.ts
│       └── events.ts
├── tests/
│   ├── unit/
│   └── e2e/
├── .github/workflows/deploy.yml
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 3. Phaser Scene Lifecycle (Detailed)

| Scene | Key | Responsibilities | Data in | Transitions to |
|---|---|---|---|---|
| BootScene | `boot` | Detect device capability, register singletons (`EventBus`, `SaveManager`) via `ServiceLocator` | — | `preload` |
| PreloadScene | `preload` | Load atlases, audio, tilemaps, fonts; render progress bar | — | `mainmenu` |
| MainMenuScene | `mainmenu` | Title screen, player-count select, settings, load save data | — | `stage` with `{ stageId, playerCount }` |
| StageScene | `stage` | Core gameplay loop; spawns via `SpawnSystem`; runs `hud` in parallel | `{ stageId, playerCount, checkpoint? }` | `boss` on trigger, or `gameover` on all-lives-lost |
| BossScene | `boss` | Boss encounter, camera lock to arena, phase-based AI | `{ stageId, bossId, playerState }` | `victory` or `gameover` |
| VictoryScene | `victory` | Stage-clear summary, score tally, unlock next stage | `{ score, stageId }` | next `stage`, or `mainmenu` after stage 8 |
| GameOverScene | `gameover` | Continue/retry prompt with countdown | `{ score, stageId, checkpoint }` | `stage` (retry from checkpoint) or `mainmenu` |
| HudScene | `hud` | Persistent overlay launched alongside `stage`/`boss` via `scene.launch` | reads shared `registry` data each frame | runs parallel, never `start`s directly |

**Transition pattern:**

```typescript
// Full scene swap
this.scene.start('stage', { stageId: 'stage2', playerCount: 2 });

// Parallel overlay (HUD keeps running while StageScene swaps to BossScene underneath)
this.scene.launch('hud');
this.scene.bringToTop('hud');
```

Use a single `SceneManager` wrapper (see §9) around these calls so fade-transition timing and analytics/logging hooks live in one place instead of being scattered across every scene file.

---

## 4. Entity Class Hierarchy

```text
BaseEntity (abstract, extends Phaser.Physics.Arcade.Sprite, implements IEntity)
├── Player
├── Enemy (abstract)
│   ├── SoldierEnemy
│   ├── SniperEnemy
│   ├── TurretEnemy
│   └── AlienEnemy
├── Boss (abstract)
│   └── Stage1Boss, Stage2Boss, …
├── Pickup
└── Projectile
```

```typescript
// entities/BaseEntity.ts
export abstract class BaseEntity
  extends Phaser.Physics.Arcade.Sprite
  implements IEntity
{
  protected health: number;
  protected readonly maxHealth: number;
  protected isDead = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    maxHealth: number
  ) {
    super(scene, x, y, texture);
    this.maxHealth = maxHealth;
    this.health = maxHealth;
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  abstract update(time: number, delta: number): void;

  takeDamage(amount: number, source?: IEntity): void {
    if (this.isDead) return;
    this.health = Math.max(0, this.health - amount);
    EventBus.emit('ENTITY_DAMAGED', { entity: this, amount, source });
    if (this.health === 0) this.die();
  }

  isAlive(): boolean {
    return !this.isDead;
  }

  protected die(): void {
    this.isDead = true;
    EventBus.emit('ENTITY_DIED', { entity: this });
  }
}
```

Subclass notes (kept brief — full bodies belong in their own files):

- **Player** — owns a `StateMachine<Player>`, a `WeaponSystem` reference, invulnerability-frame timer, and lives count. Movement/animation driven entirely by state transitions (§6), not by scattered `if` checks in `update()`.
- **Enemy** (abstract) — owns an `IAiBehavior` strategy (§12) plus its own `StateMachine<Enemy>`; concrete subclasses mainly differ in sprite, `maxHealth`, `scoreValue`, and which `IAiBehavior` they're constructed with.
- **Boss** (abstract) — multi-phase `StateMachine<Boss>`, exposes `phaseThresholds: number[]` so `DamageSystem` can trigger phase transitions off health percentage rather than each boss re-implementing that check.
- **Pickup** — no health/state machine; simple overlap-triggered effect (`applyTo(player: Player): void`), destroyed after 8s if uncollected.
- **Projectile** — pooled (§10.2), not spawned with `new`; has `owner: IEntity` to avoid friendly-fire and to attribute kills correctly.

---

## 5. Core Interfaces & Types

```typescript
// types/IEntity.ts
export interface IEntity {
  update(time: number, delta: number): void;
  destroy(): void;
  takeDamage(amount: number, source?: IEntity): void;
  isAlive(): boolean;
}

// types/IWeapon.ts
export interface IWeapon {
  readonly id: string;
  readonly ammo: number;
  readonly maxAmmo: number; // -1 = infinite
  readonly fireRateMs: number;
  fire(origin: Phaser.Math.Vector2, direction: Phaser.Math.Vector2): void;
  reload(): void;
  canFire(): boolean;
}

// types/IState.ts
export interface IState<TContext = unknown> {
  enter(context: TContext): void;
  execute(context: TContext, delta: number): void;
  exit(context: TContext): void;
}

// Supporting types referenced throughout
export interface DamageInfo {
  amount: number;
  source?: IEntity;
  knockback?: Phaser.Math.Vector2;
}

export interface EntityConfig {
  texture: string;
  maxHealth: number;
  scoreValue?: number;
}
```

---

## 6. State Machine System

A single generic FSM backs Player, Enemy, and Boss state logic — avoids re-implementing enter/exit bookkeeping three times.

```typescript
// core/StateMachine.ts
export class StateMachine<TContext> {
  private states = new Map<string, IState<TContext>>();
  private current?: IState<TContext>;
  private currentKey?: string;

  constructor(private readonly context: TContext) {}

  addState(key: string, state: IState<TContext>): this {
    this.states.set(key, state);
    return this;
  }

  transition(key: string): void {
    if (this.currentKey === key) return;
    const next = this.states.get(key);
    if (!next) throw new Error(`Unknown state: ${key}`);
    this.current?.exit(this.context);
    this.current = next;
    this.currentKey = key;
    this.current.enter(this.context);
  }

  update(delta: number): void {
    this.current?.execute(this.context, delta);
  }

  get state(): string | undefined {
    return this.currentKey;
  }
}
```

**Concrete state sets:**

| Entity | States |
|---|---|
| Player | `Idle`, `Run`, `Jump`, `Crouch`, `Prone`, `Climb`, `Hurt`, `Dead`, `Respawn` |
| Enemy | `Patrol`, `Alert`, `Attack`, `Hurt`, `Dead` |
| Boss | `Phase1`, `Phase2`, `Phase3`, `Enrage`, `Dead` |

Boss phase transitions are driven by health percentage, decided centrally rather than per-boss:

```typescript
// entities/boss/Boss.ts (excerpt)
takeDamage(amount: number, source?: IEntity): void {
  super.takeDamage(amount, source);
  const pct = this.health / this.maxHealth;
  if (pct <= 0 && !this.isDead) this.fsm.transition('Dead');
  else if (pct <= 0.25) this.fsm.transition('Enrage');
  else if (pct <= 0.6) this.fsm.transition('Phase2');
}
```

---

## 7. Event Bus

```typescript
// types/events.ts
export type EventMap = {
  PLAYER_DIED: { playerId: number };
  PLAYER_RESPAWN: { playerId: number; position: Phaser.Math.Vector2 };
  ENEMY_KILLED: { enemyId: string; scoreValue: number; position: Phaser.Math.Vector2 };
  BOSS_DEFEATED: { bossId: string; stageId: string };
  STAGE_COMPLETED: { stageId: string; score: number; timeMs: number };
  WEAPON_CHANGED: { playerId: number; weaponId: string };
  GAME_PAUSED: { paused: boolean };
  ENTITY_DAMAGED: { entity: IEntity; amount: number; source?: IEntity };
  ENTITY_DIED: { entity: IEntity };
};

// core/EventBus.ts
class TypedEventBus {
  private emitter = new Phaser.Events.EventEmitter();

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    this.emitter.emit(event, payload);
  }

  on<K extends keyof EventMap>(
    event: K,
    handler: (payload: EventMap[K]) => void
  ): void {
    this.emitter.on(event, handler);
  }

  off<K extends keyof EventMap>(
    event: K,
    handler: (payload: EventMap[K]) => void
  ): void {
    this.emitter.off(event, handler);
  }
}

export const EventBus = new TypedEventBus();
```

> **Gotcha to design around:** Phaser scenes restart on retry/replay, but `EventBus` is a module-level singleton that persists. Every scene must unregister its listeners in `shutdown`, or you'll get duplicate handlers stacking up after 2–3 retries — a classic source of "why did that sound effect play twice" bugs. Add an `this.events.once('shutdown', () => EventBus.off(...))` pattern per scene.

---

## 8. Gameplay Systems

| System | Responsibility | Key methods |
|---|---|---|
| **CollisionSystem** | Registers Arcade Physics groups and wires overlap/collider callbacks between them | `registerGroups()`, `setupColliders()` |
| **SpawnSystem** | Reads a stage's spawn table, spawns enemies via `EnemyFactory` at camera-scroll triggers, enforces max-concurrent cap | `loadStage(data)`, `update(cameraX)` |
| **WeaponSystem** | Owns each player's active `IWeaponStrategy`, routes fire input, tracks ammo/cooldown, emits `WEAPON_CHANGED` | `handleInput(state)`, `equip(weaponId)` |
| **DamageSystem** | Central hit resolution: overlap callback → damage calc → `entity.takeDamage()`, i-frames, knockback | `resolveHit(a, b, dmg)` |
| **CameraSystem** | Follow with dead-zone, clamp to level bounds, screen shake, boss-arena lock | `followPlayers()`, `shake(ms, intensity)`, `lockToBossArena()` |

```typescript
// systems/CameraSystem.ts (excerpt)
followPlayers(players: Player[]): void {
  if (players.length === 1) {
    this.camera.startFollow(players[0], true, 0.1, 0.1);
    this.camera.setDeadzone(80, 60);
  } else {
    // two-player: keep both on screen, zoom out within bounds instead of hard-cutting either off
    this.camera.startFollow(this.midpointOf(players), true, 0.08, 0.08);
  }
}

shake(durationMs = 200, intensity = 0.01): void {
  this.camera.shake(durationMs, intensity);
}
```

---

## 9. Managers Layer

| Manager | Responsibility | Key methods |
|---|---|---|
| **AssetManager** | Wraps the Phaser loader; defines the manifest of atlas/audio/tilemap keys in one place | `preload(scene)` |
| **AudioManager** | Music/SFX channel separation, volume ducking, master volume | `playMusic(key, opts)`, `playSfx(key)`, `setMasterVolume(v)` |
| **SaveManager** | localStorage-backed persistence, versioned schema with migration | `load()`, `save(data)`, `migrate(old)` |
| **SceneManager** | Thin wrapper over `game.scene` for consistent fade-transition timing | `goTo(key, data)`, `launchOverlay(key)` |

```typescript
// managers/SaveManager.ts (schema)
interface SaveData {
  version: number;
  highScore: number;
  unlockedStages: string[];
  settings: {
    musicVolume: number;
    sfxVolume: number;
    controlScheme: 'keyboard' | 'gamepad';
  };
  checkpoints: Record<string, { stageId: string; x: number; y: number }>;
}

const CURRENT_VERSION = 1;
const STORAGE_KEY = 'contra-clone-save';

function migrate(raw: Partial<SaveData>): SaveData {
  // bump CURRENT_VERSION and add a branch here whenever SaveData shape changes,
  // so existing players' localStorage doesn't silently break on update
  return { version: CURRENT_VERSION, highScore: 0, unlockedStages: ['stage1'],
    settings: { musicVolume: 0.8, sfxVolume: 0.8, controlScheme: 'keyboard' },
    checkpoints: {}, ...raw };
}
```

---

## 10. Design Patterns In Practice

### 10.1 Factory — enemy & pickup creation

```typescript
// entities/enemies/EnemyFactory.ts
type EnemyCtor = new (scene: Phaser.Scene, x: number, y: number) => Enemy;

const registry: Record<string, EnemyCtor> = {
  soldier: SoldierEnemy,
  sniper: SniperEnemy,
  turret: TurretEnemy,
  alien: AlienEnemy,
};

export class EnemyFactory {
  static create(type: string, scene: Phaser.Scene, x: number, y: number): Enemy {
    const Ctor = registry[type];
    if (!Ctor) throw new Error(`Unknown enemy type: ${type}`);
    return new Ctor(scene, x, y);
  }
}
```

New enemy type = one registry line, no factory method edits — open/closed in practice.

### 10.2 Object Pool — bullets & explosions

```typescript
// core/ObjectPool.ts
export class ObjectPool<T extends Phaser.GameObjects.GameObject> {
  private pool: T[] = [];

  constructor(
    private readonly factory: () => T,
    private readonly reset: (obj: T) => void,
    initialSize = 20
  ) {
    for (let i = 0; i < initialSize; i++) {
      const obj = factory();
      (obj as unknown as { setActive: Function }).setActive(false);
      (obj as unknown as { setVisible: Function }).setVisible(false);
      this.pool.push(obj);
    }
  }

  acquire(): T {
    const obj =
      this.pool.find((o) => !(o as unknown as { active: boolean }).active) ??
      this.factory();
    (obj as unknown as { setActive: Function; setVisible: Function })
      .setActive(true)
      .setVisible(true);
    return obj;
  }

  release(obj: T): void {
    this.reset(obj);
    (obj as unknown as { setActive: Function; setVisible: Function })
      .setActive(false)
      .setVisible(false);
  }
}
```

### 10.3 Observer — Event Bus (§7)

### 10.4 State — StateMachine (§6)

### 10.5 Strategy — weapons (§11) and AI behaviors (§12)

---

## 11. Weapon System Design

| Weapon | Fire pattern | Ammo | Fire rate | Notes |
|---|---|---|---|---|
| Machine Gun | Single forward shot | Infinite | 120ms | Default/starting weapon |
| Spread Gun | 5-way fan | Infinite | 250ms | Wide close-range coverage |
| Laser Gun | Piercing beam | Infinite | 350ms | Hits multiple enemies in a line |
| Fire Gun | Short-range arc, lingering damage-over-time patch | Infinite | 400ms | High risk/reward, close range |

```typescript
// weapons/IWeaponStrategy.ts
export interface IWeaponStrategy extends IWeapon {}

// weapons/SpreadGun.ts (excerpt)
export class SpreadGun implements IWeaponStrategy {
  readonly id = 'spread';
  readonly ammo = -1;
  readonly maxAmmo = -1;
  readonly fireRateMs = 250;
  private lastFired = 0;

  constructor(private pool: ObjectPool<Projectile>) {}

  canFire(): boolean {
    return this.pool !== undefined;
  }

  fire(origin: Phaser.Math.Vector2, direction: Phaser.Math.Vector2): void {
    const angles = [-15, -7.5, 0, 7.5, 15];
    for (const deg of angles) {
      const bullet = this.pool.acquire();
      bullet.launch(origin, direction.clone().rotate(Phaser.Math.DegToRad(deg)));
    }
  }

  reload(): void {}
}
```

Per the original doc, all weapons in the original Contra formula are non-stacking pickups that **replace** the current weapon — confirm that's still the intended design before building an inventory/swap UI, since that's a small but meaningful scope difference from an ammo-stockpiling design.

---

## 12. Enemy AI Design

```typescript
// ai/IAiBehavior.ts
export interface IAiBehavior {
  update(enemy: Enemy, player: Player, delta: number): void;
}
```

| Behavior | Used by | Logic |
|---|---|---|
| `PatrolBehavior` | SoldierEnemy | Walk between two x-bounds; switch to `ChaseBehavior`-like alert if player enters line-of-sight range |
| `ChaseBehavior` | AlienEnemy | Move toward player's x position, ignore terrain gaps (flying) or pathfind around (ground — flag as needing a simple nav check) |
| `TurretBehavior` | TurretEnemy | Stationary, rotate toward player, fire on interval when in range |
| Sniper (custom, extends Patrol) | SniperEnemy | Long idle, telegraphed aim delay (~600ms) before firing a high-damage shot |

Spawn budget: cap concurrent active enemies at 12 (see §19 performance table) and drive stage difficulty by *spawn density and type mix* per stage JSON rather than by scaling individual enemy stats — keeps balancing centralized in data files instead of scattered constants.

---

## 13. Multiplayer Architecture

### 13.1 Local co-op (in scope for v1)

- Input mapping:

| Player | Move/Aim | Jump | Fire | Pause |
|---|---|---|---|---|
| P1 | Arrow keys | `Z` | `X` | `Esc` |
| P2 | `WASD` | `Tab`... *or* gamepad if detected | gamepad face button | — |

- Gamepad detection via `navigator.getGamepads()`, polled in `InputSystem` each frame (see §15); falls back to keyboard mapping above if no gamepad present.
- Friendly fire: **off** by default — player bullets should not damage the other player. Flag as a settings-menu toggle if you want it configurable later.
- **Open decision, not yet resolved by the original doc:** shared lives pool vs. per-player lives. This materially changes `GameOverScene` trigger logic (all-players-dead vs. either-player-dead) and the `SaveManager` checkpoint schema — worth deciding before building `DamageSystem`'s death handling.

### 13.2 Camera in two-player mode

Covered in §8 CameraSystem — follow the midpoint, zoom out within a min/max bound rather than hard-locking either player off-screen, which is the usual failure mode in shared-screen co-op shooters.

### 13.3 Split vs. shared screen

The original doc implies shared-screen (single camera). If split-screen is actually wanted, that's a materially different `CameraSystem` (two `Phaser.Cameras.Scene2D.Camera` instances with separate viewports) — worth confirming since it changes §8 non-trivially.

### 13.4 Future: networked co-op

Deliberately left undesigned here. If pursued post-v1: a fixed-tick deterministic simulation is what makes rollback netcode tractable later, so if you want to keep that door open, the main thing to avoid *now* is any use of `Math.random()` or wall-clock timing inside gameplay logic (RNG should be seeded and timing should be delta-based, which the architecture above already does). Full netcode design is its own document once v1 is stable.

---

## 14. Physics & Collision

Arcade Physics groups: `playerGroup`, `enemyGroup`, `playerBulletGroup`, `enemyBulletGroup`, `pickupGroup`, `terrainLayer`.

| | Player | Enemy | Player Bullet | Enemy Bullet | Pickup | Terrain |
|---|---|---|---|---|---|---|
| **Player** | – | overlap → damage | – | overlap → damage | overlap → collect | collide |
| **Enemy** | | – | overlap → damage | – | – | collide (ground types only) |
| **Player Bullet** | | | – | – | – | collide → destroy bullet |
| **Enemy Bullet** | | | | – | – | collide → destroy bullet |

`CollisionSystem.setupColliders()` is the single place all of these pairs get registered — avoid adding ad-hoc `physics.add.overlap` calls inside individual entity classes, or the collision graph becomes hard to audit.

---

## 15. Input System

```typescript
// types/InputState.ts
export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  fire: boolean;
  pause: boolean;
}
```

One `InputState` object per player, polled once per frame in `StageScene.update()` from either keyboard (`Phaser.Input.Keyboard`) or `navigator.getGamepads()[i]`, then passed down to `Player.update()`. Touch controls (on-screen d-pad + fire button, shown only when a touch pointer is detected) map onto the same `InputState` shape so `Player` never needs to know which input source it came from.

---

## 16. Save System

Schema and versioning covered in §9 (SaveManager). Storage key: `contra-clone-save` in `localStorage`. On load, always run new data through `migrate()` — never read the raw stored object directly — so a schema change doesn't silently corrupt old players' saves.

---

## 17. Audio System

- **Music** — one looping track per scene, crossfaded on scene transition (`AudioManager.playMusic(key, { loop: true, fadeMs: 500 })`).
- **SFX** — short one-shots, played through a pooled channel so rapid-fire weapons don't spawn dozens of overlapping `Sound` instances; bundle short effects into a single audio-sprite sheet to cut HTTP requests.
- **Ducking** — music volume drops ~40% during boss intro dialogue/cutscenes, restored on scene resume.
- **Formats** — ship `.ogg` with `.mp3` fallback for Safari/iOS compatibility; Phaser's loader accepts an array and picks the first supported format.

---

## 18. UI / HUD System

`HudScene` runs parallel to `StageScene`/`BossScene` (see §3) and reads shared state via the scene `registry` rather than reaching into `StageScene` directly — keeps the HUD decoupled from whichever gameplay scene is currently active.

| Component | Driven by |
|---|---|
| `LivesDisplay` | `PLAYER_DIED` / `PLAYER_RESPAWN` events |
| `WeaponIcon` | `WEAPON_CHANGED` event |
| `ScoreCounter` | `ENEMY_KILLED` event (accumulates `scoreValue`) |
| `BossHealthBar` | active only during `BossScene`, driven by `ENTITY_DAMAGED` on the boss entity |

---

## 19. Performance Strategy

| Resource | Budget |
|---|---|
| Concurrent pooled bullets | 60 |
| Concurrent active enemies | 12 |
| Concurrent particle emitters | 8 |
| Max texture atlas size | 2048×2048 (mobile GPU-safe) |
| Target frame budget | 16.6ms (60 FPS desktop) |
| Mobile fallback | 30 FPS toggle in settings if device benchmark is low |

- **Object pooling** for all bullets/explosions/particles (§10.2) — no `new Projectile()` during gameplay after warm-up.
- **Texture atlases** packed per stage, not one global atlas, so `PreloadScene` only loads what the selected stage needs.
- **Culling**: rely on Phaser's built-in camera culling for rendering, plus a custom check in `SpawnSystem`/`Enemy.update()` that deactivates (returns to pool, if pooled) any enemy or bullet more than one screen-width outside camera bounds.
- **Lazy loading**: stage-specific assets (tileset, enemy atlas variants, boss sprite) load in a per-stage preload step rather than all at boot, keeping initial load time down.

---

## 20. Asset Pipeline

```text
Concept Art → Sprite Production (Aseprite/Piskel) → Atlas Packing (TexturePacker
or free-tex-packer) → Animation Definition (Phaser AnimationManager JSON) →
Tilemap Authoring (Tiled) → Scene Integration → Optimization (atlas trim, audio
sprite packing)
```

Naming convention: `stage{n}_{entity}_{action}.png` (e.g. `stage1_soldier_walk.png`), atlases named `stage{n}.atlas.png` / `.json`, keeping asset-to-stage ownership obvious in the folder tree from §2.

---

## 21. Build & CI/CD Pipeline

```text
Developer → Git → GitHub Actions → Lint + Unit Tests (Vitest) →
Playwright Smoke Test → Production Build (Vite) → Cloudflare Pages Deploy
```

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run test        # vitest unit tests
      - run: npm run test:e2e    # playwright smoke test
      - run: npm run build
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          projectName: contra-clone
          directory: dist
```

**Test coverage priorities** (pure logic first — Phaser rendering itself isn't worth unit testing):

- Unit: `StateMachine`, `EventBus`, `ObjectPool`, `WeaponSystem` fire-rate/ammo logic, `SaveManager` migration.
- E2E (Playwright): game boots to `MainMenuScene` without console errors, canvas renders, starting a stage transitions scenes correctly.

---

## 22. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Frame rate (desktop) | Stable 60 FPS |
| Frame rate (mobile) | 30 FPS minimum, 60 FPS on capable devices |
| Initial load (Preload → MainMenu) | < 3s on a typical broadband connection |
| Total bundle size (JS, gzipped) | < 500 KB for the core engine bundle, stage assets loaded separately |
| Browser support | Last 2 versions of Chrome, Firefox, Safari, Edge; iOS Safari; Android Chrome |
| Input latency | < 1 frame perceived delay on keyboard/gamepad input |

---

## 23. Development Milestones

| Phase | Deliverable | Acceptance criteria |
|---|---|---|
| 0 — Scaffolding | Vite + Phaser + TS project boots to an empty `BootScene` → `PreloadScene` → blank `MainMenuScene` | CI pipeline green, deploys a placeholder page to Cloudflare Pages |
| 1 — Core movement | Player entity with full state machine, one test stage tilemap, camera follow | Player can run/jump/crouch through a static test level at 60 FPS |
| 2 — Combat basics | Machine Gun + one enemy type (SoldierEnemy) + CollisionSystem + DamageSystem | Player can kill and be killed by enemies; i-frames and knockback work |
| 3 — Full weapon + enemy roster | All 4 weapons, all 4 enemy types, pickups | Weapon switching, all AI behaviors functional in test stage |
| 4 — Boss + stage loop | One full stage with a boss, `VictoryScene`/`GameOverScene` wiring | Stage 1 fully playable start-to-finish, checkpoint/retry works |
| 5 — Two-player co-op | Second player input, shared-screen camera, lives-pool decision resolved (§13.1) | Two players can complete Stage 1 together on one keyboard/gamepad combo |
| 6 — Content scale-up | Remaining 7 stages + bosses built on the established pipeline | All 8 stages playable, difficulty curve reviewed |
| 7 — Mobile + polish | Touch controls, gamepad remapping UI, performance pass against §19/§22 budgets | Meets NFR targets on a mid-tier Android device |

---

## 24. Release Goals

- [ ] Full 8 stages, each with a boss
- [ ] Local two-player support (lives-pool model decided — see §13.1)
- [ ] Gamepad support alongside keyboard
- [ ] Stable 60 FPS desktop / 30 FPS mobile floor
- [ ] Desktop and mobile browser support (touch controls included)
- [ ] Save/checkpoint system persists across sessions
- [ ] CI pipeline: lint + unit + smoke tests gating every deploy to Cloudflare Pages

---

### Open questions to resolve before/during implementation

1. Shared vs. per-player lives pool (§13.1) — changes `GameOverScene` trigger and save schema.
2. Shared-screen vs. true split-screen camera (§13.3) — changes `CameraSystem` scope materially.
3. Weapon pickups: replace-current vs. stockpile/inventory (§11) — changes HUD and `WeaponSystem` design.
4. Whether the mobile touch layer is a v1 requirement or can land in Phase 7 alongside the performance pass (§23) — affects how early `InputState` needs its touch branch.
