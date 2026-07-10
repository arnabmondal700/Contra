# Active Context

## Current State
- Phase 6 — Content Scale-Up is complete and verified (`npm run lint` + `npm run build` pass).
- All 8 stages are now defined with data-driven configurations, each with unique enemies, pickups, themes, and bosses.
- BossFactory provides generic boss creation from bossId.
- SpawnSystem handles camera-triggered enemy spawning with configurable pool limits.
- Stage selection available in MainMenu (LEFT/RIGHT arrows to cycle stages).
- Victory scene chains stages together sequentially (stage1 → stage2 → ... → stage8 → "ALL STAGES COMPLETE!").
- Save system unlocks stages as they are completed.

## In Progress
- None. Ready for the next requested phase or task.

## Next Up
- Phase 7 — Mobile + polish (touch controls, performance pass)