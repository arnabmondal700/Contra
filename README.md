# Contra Clone

A browser-based 2D side-scrolling run-and-gun game inspired by the classic NES Contra, built with **Phaser 3**, **TypeScript**, and **Vite**.

## 🎮 Features

- 8 stages with unique boss encounters
- Local two-player cooperative play (shared-screen)
- 4 weapon types: Machine Gun, Spread Gun, Laser Gun, Fire Gun
- 4 enemy types: Soldier, Sniper, Turret, Alien
- Keyboard, gamepad, and touch input support
- Full stage-boss-victory-gameover lifecycle with checkpoints
- Save/checkpoint persistence via localStorage
- Desktop and mobile browser support

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Phaser 3 (Arcade Physics) | Game framework |
| TypeScript (strict mode) | Language |
| Vite | Build tool |
| Vitest | Unit testing |
| Playwright | E2E testing |
| Cloudflare Pages | Hosting |
| GitHub Actions | CI/CD |

## 📋 Prerequisites

- Node.js 20+
- npm

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Production build
npm run build

# Lint check
npm run lint
```

## 🎯 Controls

| Action | Player 1 | Player 2 |
|---|---|---|
| Move | Arrow Keys | WASD |
| Jump | Z | K |
| Fire | X | J |

## 📁 Project Structure

```
contra-clone/
├── public/assets/         # Game assets (atlases, audio, tilemaps)
├── src/
│   ├── main.ts            # Entry point
│   ├── config/            # Game configuration
│   ├── scenes/            # 8 Phaser scenes
│   ├── entities/          # Player, enemies, bosses, pickups
│   ├── systems/           # Gameplay systems
│   ├── managers/          # Singleton managers
│   ├── core/              # EventBus, StateMachine, ObjectPool
│   ├── weapons/           # Weapon strategies
│   ├── ai/                # AI behaviors
│   ├── ui/                # HUD components
│   ├── data/              # Stage configurations
│   └── types/             # TypeScript interfaces
├── tests/                 # Unit and E2E tests
└── .github/workflows/     # CI/CD pipeline
```

## 🏗️ Development Phases

| Phase | Focus | Status |
|---|---|---|
| 0 | Scaffolding | ✅ Complete |
| 1 | Core movement | 🔄 In Progress |
| 2 | Combat basics | ⬜ Pending |
| 3 | Full roster | ⬜ Pending |
| 4 | Boss + stage loop | ⬜ Pending |
| 5 | Two-player co-op | ⬜ Pending |
| 6 | Content scale-up | ⬜ Pending |
| 7 | Mobile + polish | ⬜ Pending |

## 📄 License

MIT
