# Active Context: Contra Clone

## Current State: Phase 0 -- Scaffolding (COMPLETE)
The project now has a fully bootable Phaser 3 + TypeScript + Vite setup with all placeholder scenes and core infrastructure.

## What Exists
- Full project structure with 22+ directories matching the architecture spec
- Phaser 3.80, TypeScript 5.5, Vite 5, Vitest, and Playwright installed
- TypeScript strict mode configured with ES2020 target
- Vite build pipeline with Phaser code-splitting (335 KB gzipped)
- 8 Phaser scenes: Boot, Preload, MainMenu, Stage, Boss, Victory, GameOver, Hud
- Core modules: EventBus (typed), StateMachine (generic FSM), ObjectPool, ServiceLocator
- CI/CD pipeline: GitHub Actions -> Lint -> Test -> Build -> Cloudflare Pages
- index.html, .gitignore, package.json with proper scripts
- Full Memory Bank (6 files)
- Production build verified (Vite build succeeds, CI lint passes)

## Recent Activity
- Initialized npm project with all dependencies
- Created folder structure per architecture spec (src/config, scenes, entities, systems, managers, core, weapons, ai, ui, data, types)
- BootScene, PreloadScene, MainMenuScene implemented with scene transitions
- StageScene, BossScene, VictoryScene, GameOverScene, HudScene as placeholders with keyboard navigation
- EventBus with typed EventMap, StateMachine generic FSM, ObjectPool with Poolable interface, ServiceLocator singleton registry
- GameConfig with Arcade Physics, pixel art rendering, fit scaling
- Ghost file cleanup from initial encoding issues

## Active Decisions Pending
1. **Shared vs. per-player lives pool** -- affects GameOverScene trigger and SaveManager schema
2. **Weapon pickup behavior** -- replace-current (classic Contra) vs. stockpile/inventory
3. **Mobile touch layer timing** -- v1 requirement or Phase 7 polish?
4. **Shared-screen confirmed** -- assumed but not explicitly locked

## Next Steps (Phase 1)
1. Implement Player entity with full StateMachine (Idle, Run, Jump, Crouch, Prone, Climb, Hurt, Dead, Respawn)
2. Create test stage tilemap for player movement testing
3. Implement CameraSystem (follow, dead-zone, bounds)
4. Implement keyboard InputSystem with InputState
5. Verify player can run/jump/crouch through test level at 60 FPS

## Risks
- Player entity needs sprite/animation placeholders (use colored rectangles if no sprites yet)
- Arcade Physics gravity needs tuning for Contra-like jump feel
- Camera dead-zone values (80, 60) from the spec may need adjustment