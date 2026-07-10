# Product Context: Contra Clone

## Why This Project Exists
The Contra Clone recreates the classic NES Contra experience as a modern web application. It serves as both a portfolio piece demonstrating full-stack game development with Phaser 3 and TypeScript, and a fully playable nostalgic game accessible from any browser without plugins.

## User Experience Goals
1. **Authentic Contra Feel**: Responsive run-and-gun gameplay with tight controls, screen-shake on explosions, and the signature weapon variety
2. **Instant Accessibility**: No downloads or installs -- open a URL and play; under 3s initial load time
3. **Co-op Friendly**: Seamless local two-player on the same device (keyboard + gamepad or shared keyboard)
4. **Mobile Ready**: Touch controls that do not feel like an afterthought; stable 30 FPS minimum on mid-tier devices
5. **Progression System**: Checkpoint saves, stage unlocks, and score persistence keep players coming back
6. **Polished Presentation**: Smooth 60 FPS animations, screen transitions, audio feedback, and a clear HUD

## How Users Interact With It
- **Main Menu**: Title screen, player count selection, continue from save or start new game
- **Gameplay**: Side-scrolling stages with enemies, obstacles, and pickups; boss encounters at stage end
- **HUD**: Lives, score, current weapon indicator, boss health bar during boss fights
- **Game Over**: Continue/retry prompt with countdown; return to main menu
- **Victory**: Stage-clear summary with score tally, progression to next stage

## Key Differentiators From The Original
- Runs in a browser (no emulator, no plugin)
- Modern save system (localStorage-based, survives browser close)
- Gamepad support alongside keyboard
- Mobile touch controls
- Performance-optimized for modern devices while maintaining retro aesthetic