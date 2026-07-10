# Project Brief: Contra Clone

## Overview
A browser-based 2D side-scrolling run-and-gun game inspired by the classic NES Contra, built with Phaser 3, TypeScript, and modern web tooling.

## Core Requirements
- 8 stages, each with a unique boss encounter
- Local two-player cooperative play (shared-screen)
- Desktop and mobile browser support
- 4 weapon types: Machine Gun, Spread Gun, Laser Gun, Fire Gun
- 4 enemy types: Soldier, Sniper, Turret, Alien
- Full stage-boss-victory-gameover lifecycle with checkpoints
- Save/checkpoint persistence via localStorage
- Gamepad support alongside keyboard
- Touch controls for mobile
- Performance targets: 60 FPS desktop, 30 FPS minimum mobile

## Technical Stack
- **Rendering**: Phaser 3.9x (Arcade Physics)
- **Language**: TypeScript 5.x (strict mode)
- **Build**: Vite
- **Testing**: Vitest (unit) + Playwright (e2e)
- **Deployment**: Cloudflare Pages via GitHub Actions

## Scope Boundaries (v1)
- **In scope**: Local co-op, keyboard/gamepad/touch input, 8 stages, 8 bosses, full weapon/enemy roster, save/checkpoint system, HUD
- **Out of scope**: Networked multiplayer, rollback netcode, split-screen (shared-screen only)

## Key Open Decisions
1. Shared vs. per-player lives pool
2. Shared-screen vs. split-screen (assumed shared)
3. Weapon pickups: replace-current vs. stockpile/inventory (assumed replace)
4. Mobile touch layer: v1 requirement or Phase 7 polish

## Development Phases
| Phase | Focus | Deliverable |
|---|---|---|
| 0 | Scaffolding | Vite + Phaser + TS project boots to MainMenu |
| 1 | Core movement | Player FSM, test tilemap, camera follow |
| 2 | Combat basics | MachineGun + SoldierEnemy + collisions |
| 3 | Full roster | All 4 weapons, 4 enemies, pickups |
| 4 | Boss loop | Stage 1 with boss, GameOver/Victory |
| 5 | Two-player co-op | P2 input, shared camera |
| 6 | Content scale-up | Stages 2-8 built on established pipeline |
| 7 | Mobile + polish | Touch controls, performance pass |