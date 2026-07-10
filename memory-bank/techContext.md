# Tech Context: Contra Clone

## Stack
| Technology | Version | Purpose |
|---|---|---|
| Phaser 3 | 3.9x | Game framework, Arcade Physics |
| TypeScript | 5.x (strict) | Language |
| Vite | latest | Build tool |
| Vitest | latest | Unit testing |
| Playwright | latest | E2E smoke testing |
| Cloudflare Pages | -- | Hosting |
| GitHub Actions | -- | CI/CD |

## Project Structure
```
contra-clone/
|-- public/assets/{atlases,audio,tilemaps,fonts}/
|-- src/
|   |-- main.ts
|   |-- config/         (GameConfig, PhysicsConfig, InputConfig)
|   |-- scenes/         (8 scenes)
|   |-- entities/       (player/, enemies/, boss/, pickups/, projectiles/)
|   |-- systems/        (5 systems)
|   |-- managers/       (4 managers)
|   |-- core/           (EventBus, StateMachine, ObjectPool, ServiceLocator)
|   |-- weapons/        (4 weapon strategies)
|   |-- ai/             (3 AI behaviors)
|   |-- ui/             (HUD components)
|   |-- data/           (Stage JSON configs)
|   |-- types/          (Interfaces)
|-- tests/{unit/,e2e/}
|-- .github/workflows/deploy.yml
|-- vite.config.ts
|-- tsconfig.json
|-- package.json
```

## Commands
- `npm run dev` -- Vite dev server
- `npm run test` -- Vitest
- `npm run test:e2e` -- Playwright
- `npm run build` -- Production build

## Key Constraints
- Arcade Physics (not Matter.js)
- No Math.random() in gameplay -- use seeded RNG for future deterministic replay/netcode
- Stage-specific atlas loading (not one global atlas)
- Object pooling for bullets, explosions, particles
- Max 12 concurrent enemies, 60 pooled bullets
- Texture atlases max 2048x2048
- Audio: .ogg + .mp3 fallback

## Performance Budgets
| Metric | Target |
|---|---|
| Desktop FPS | Stable 60 |
| Mobile FPS | 30 min, 60 capable |
| Initial load | < 3s broadband |
| Core JS gzipped | < 500 KB |
| Stage assets | Per-stage lazy load |

## CI/CD Pipeline
```
Push -> Lint -> Unit Tests -> Playwright Smoke -> Build -> Cloudflare Pages Deploy
```

## Browser Support
Last 2 versions: Chrome, Firefox, Safari, Edge; iOS Safari; Android Chrome.