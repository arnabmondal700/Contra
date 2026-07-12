# Player Character & Movement Animation — Developer Spec

> Companion doc to `contra_clone_technical_architecture_v2.md` §4 (Entity Hierarchy) and §6 (State Machine). Covers what the art needs to produce, how it's packed, and the Phaser/TypeScript code that wires it to the existing `Player` state machine.

---

## 1. Visual Design Brief

- **Style**: pixel-art humanoid commando, matching the Contra visual language (not chibi/cartoon proportions) — roughly 6–7 heads tall for a readable "action hero" silhouette at gameplay zoom.
- **Frame canvas**: 64×64 px per frame (body + weapon + margin for muzzle flash). Actual sprite occupies roughly the center 32×56 — leave headroom so jump/prone poses don't clip the canvas edge.
- **Palette-swap for player identity**: classic Contra approach — P1 = blue/green fatigues, P2 = red fatigues, single shared base sprite with a palette swap rather than two fully separate art sets. Keeps art production to one character.
- **Silhouette test**: every pose should read correctly in solid black silhouette at 50% scale — this is the actual bar pixel artists use for "looks human and readable," not fine detail.

---

## 2. Design Decision: Directional Aiming (flag before art starts)

Classic Contra has hand-drawn poses for each aim direction while running (a big part of "feels like a human soldier" rather than "sprite with a gun bolted on"). That's also the most expensive part of the art budget. Two viable approaches — pick one before commissioning frames, since it changes both the art list and the code below:

| Approach | Art cost | Fidelity | Recommended when |
|---|---|---|---|
| **A — Layered gun overlay** (body plays idle/run/jump only; a separate weapon sprite rotates on top, pivoted at the shoulder) | Low — one pose set for the body | Good, slightly less "hand-drawn" in the joints | Solo dev / limited art budget — **default recommendation for this project** |
| **B — Full directional pose sets** (distinct run/idle frames per aim angle, like original Contra) | High — multiplies frame count by ~5 aim directions | Best, most authentic | Only if you have an artist producing bespoke frames per direction |

Everything below defaults to **Approach A**, since it's the practical choice for a solo/small-team build and still reads as a human character. Section 7 shows how to swap to Approach B if you later have the art budget.

---

## 3. Required Poses (Approach A — body only, no per-direction duplicates)

| Animation | Frames | Notes |
|---|---|---|
| `idle` | 4 | Subtle breathing/weight-shift loop, not a static frame — a fully static idle reads as "stiff," not human |
| `run` | 6 | Full stride cycle; this is the one animation worth spending the most frames on, since it's on-screen constantly |
| `jump-rise` | 2 | Legs tucking, plays once on takeoff |
| `jump-fall` | 2 | Legs extending for landing, plays once while falling |
| `jump-land` | 2 | Brief crouch-absorb on touchdown, plays once then returns to idle/run |
| `crouch-idle` | 2 | Weight-shift loop while crouched and stationary |
| `crouch-move` | 4 | Duck-walk cycle |
| `prone` | 1 | Static is acceptable here — brief, low-frequency pose |
| `climb` | 4 | Ladder/vine climb cycle |
| `hurt` | 1 | Single recoil frame, held during i-frame flash (§9) |
| `dead` | 3 | Death sequence, plays once, non-looping |
| `respawn` | 2 | Optional "flicker in" pose if you want a visual beat distinct from the invulnerability tint |

**Weapon overlay** (separate small sprite, layered above the body, Approach A): 4 frames — `gun-idle`, `gun-run`, `gun-jump`, `gun-crouch` — each just the arm+weapon silhouette at rest, rotated at runtime toward the aim angle rather than hand-drawn per angle.

Total: ~30 body frames + 4 overlay frames — a realistic scope for one pixel artist to turn around, versus 100+ frames under Approach B.

---

## 4. Atlas / Sprite Sheet Packing

- Pack via TexturePacker (or the free `free-tex-packer`) into a single `player.atlas.png` / `player.atlas.json` (Phaser 3 JSON Hash format).
- Frame naming convention — **this naming is what the animation code in §6 keys off, so keep it exact**:

```text
player_idle_00.png ... player_idle_03.png
player_run_00.png  ... player_run_05.png
player_jumprise_00.png, player_jumprise_01.png
player_jumpfall_00.png, player_jumpfall_01.png
player_jumpland_00.png, player_jumpland_01.png
player_crouchidle_00.png, player_crouchidle_01.png
player_crouchmove_00.png ... player_crouchmove_03.png
player_prone_00.png
player_climb_00.png ... player_climb_03.png
player_hurt_00.png
player_dead_00.png ... player_dead_02.png
player_respawn_00.png, player_respawn_01.png

gun_idle_00.png
gun_run_00.png
gun_jump_00.png
gun_crouch_00.png
```

- Trim transparent padding on export (reduces atlas size — matters for the mobile texture-atlas budget in the main architecture doc §19), but keep a consistent **pivot/anchor point** across all frames (feet-center) so the sprite doesn't visually jitter between animations.

---

## 5. Folder placement

```text
public/assets/atlases/
├── player.atlas.png
└── player.atlas.json
```

Registered in `AssetManager` (main architecture doc §9) alongside the other stage atlases, loaded once in `PreloadScene` since the player persists across all stages.

---

## 6. Phaser Animation Setup

```typescript
// config/PlayerAnimations.ts
export function createPlayerAnimations(scene: Phaser.Scene): void {
  const anims = scene.anims;

  const def = (
    key: string,
    prefix: string,
    start: number,
    end: number,
    frameRate: number,
    repeat: number
  ) => {
    anims.create({
      key,
      frames: anims.generateFrameNames('player', {
        prefix,
        start,
        end,
        zeroPad: 2,
        suffix: '.png',
      }),
      frameRate,
      repeat,
    });
  };

  def('player-idle', 'player_idle_', 0, 3, 6, -1);
  def('player-run', 'player_run_', 0, 5, 12, -1);
  def('player-jump-rise', 'player_jumprise_', 0, 1, 8, 0);
  def('player-jump-fall', 'player_jumpfall_', 0, 1, 8, 0);
  def('player-jump-land', 'player_jumpland_', 0, 1, 10, 0);
  def('player-crouch-idle', 'player_crouchidle_', 0, 1, 5, -1);
  def('player-crouch-move', 'player_crouchmove_', 0, 3, 10, -1);
  def('player-climb', 'player_climb_', 0, 3, 8, -1);
  def('player-dead', 'player_dead_', 0, 2, 6, 0);
  def('player-respawn', 'player_respawn_', 0, 1, 4, 2);

  // single-frame "animations" for consistency of API — still addressable via .play()
  anims.create({ key: 'player-prone', frames: [{ key: 'player', frame: 'player_prone_00.png' }] });
  anims.create({ key: 'player-hurt', frames: [{ key: 'player', frame: 'player_hurt_00.png' }] });

  // weapon overlay
  def('gun-idle', 'gun_idle_', 0, 0, 1, -1);
  def('gun-run', 'gun_run_', 0, 0, 1, -1);
  def('gun-jump', 'gun_jump_', 0, 0, 1, -1);
  def('gun-crouch', 'gun_crouch_', 0, 0, 1, -1);
}
```

Call once from `PreloadScene.create()`, after the atlas has finished loading and before any `Player` is instantiated.

---

## 7. Wiring Animations to the State Machine

Each `IState<Player>` (from the main architecture doc §6) plays its animation in `enter()`, not in `execute()` — `execute()` should only run per-frame movement/physics logic, so the animation doesn't restart every frame.

```typescript
// entities/player/PlayerStates.ts
export class RunState implements IState<Player> {
  enter(player: Player): void {
    player.play('player-run');
  }
  execute(player: Player, delta: number): void {
    player.handleHorizontalMovement(delta);
    if (!player.body || player.body.velocity.x === 0) {
      player.fsm.transition('Idle');
    }
  }
  exit(): void {}
}

export class JumpState implements IState<Player> {
  enter(player: Player): void {
    player.play('player-jump-rise');
  }
  execute(player: Player, delta: number): void {
    player.handleAirMovement(delta);
    if (player.body!.velocity.y > 0) {
      player.play('player-jump-fall', true); // ignoreIfPlaying = true, avoid restart spam
    }
    if (player.body!.blocked.down) {
      player.fsm.transition('JumpLand');
    }
  }
  exit(): void {}
}
```

**Weapon overlay sync** — the gun sprite is a child `Phaser.GameObjects.Sprite` positioned relative to the player each frame, with its animation key mirroring the body's locomotion state rather than driven by its own state machine:

```typescript
// entities/player/Player.ts (excerpt)
private gunSprite: Phaser.GameObjects.Sprite;

update(time: number, delta: number): void {
  this.fsm.update(delta);
  this.syncGunOverlay();
}

private syncGunOverlay(): void {
  const bodyState = this.fsm.state; // 'Run' | 'Idle' | 'Jump...' | 'Crouch...'
  const gunKey = bodyState?.startsWith('Crouch')
    ? 'gun-crouch'
    : bodyState?.startsWith('Jump')
    ? 'gun-jump'
    : bodyState === 'Run'
    ? 'gun-run'
    : 'gun-idle';

  this.gunSprite.play(gunKey, true);
  this.gunSprite.setPosition(this.x + (this.flipX ? -8 : 8), this.y - 4);
  this.gunSprite.setFlipX(this.flipX);
  this.gunSprite.setRotation(this.aimAngle); // aimAngle set by WeaponSystem from input
}
```

---

## 8. Facing Direction

```typescript
handleHorizontalMovement(delta: number): void {
  const input = this.inputState;
  if (input.left) {
    this.setVelocityX(-this.moveSpeed);
    this.setFlipX(true);
  } else if (input.right) {
    this.setVelocityX(this.moveSpeed);
    this.setFlipX(false);
  } else {
    this.setVelocityX(0);
  }
}
```

`setFlipX` mirrors the whole body sprite; the gun overlay's `setFlipX` and offset (§7) must be kept in sync manually since it's a separate game object, not a child of a container that would flip automatically — this is the most common bug spot in a layered-sprite setup, worth a dedicated visual test (walk left/right, confirm the gun stays on the correct side and doesn't detach).

---

## 9. Hit Feedback (reads as "human," not just mechanically correct)

```typescript
// entities/player/Player.ts (excerpt)
takeDamage(amount: number, source?: IEntity): void {
  if (this.invulnerable) return;
  super.takeDamage(amount, source);
  this.fsm.transition('Hurt');
  this.startInvulnerability();
}

private startInvulnerability(durationMs = 1500): void {
  this.invulnerable = true;
  this.scene.tweens.add({
    targets: this,
    alpha: { from: 1, to: 0.3 },
    duration: 80,
    yoyo: true,
    repeat: Math.floor(durationMs / 160),
    onComplete: () => {
      this.invulnerable = false;
      this.setAlpha(1);
      this.fsm.transition('Idle');
    },
  });
}
```

Blink-flicker during i-frames is a small detail but it's the thing that most reads as "a human character got hit," alongside the single recoil frame — worth keeping even under an art-budget crunch, ahead of some of the locomotion polish frames.

---

## 10. QA Checklist

- [ ] Idle loop has visible weight-shift, not a single static frame
- [ ] Run cycle doesn't "slide" — front foot plants roughly on frame the body's lowest point touches ground
- [ ] Jump rise → fall → land plays as one continuous read, no visible pop/snap between the three clips
- [ ] Gun overlay stays attached and correctly flipped through every locomotion state, both facing directions
- [ ] Hurt flash + i-frame blink clearly communicates "temporarily invulnerable" without being distracting
- [ ] Death sequence doesn't loop and holds on the final frame until `PLAYER_RESPAWN` fires
- [ ] All animations verified at both 100% and the minimum supported zoom (mobile) for silhouette readability
