// src/config/PhysicsConfig.ts
export const PHYSICS_CONFIG = {
  gravity: { x: 0, y: 900 },
  player: {
    speed: 180,
    jumpVelocity: -380,
    crouchSpeed: 60,
    proneSpeed: 30,
    climbSpeed: 100,
    maxFallSpeed: 600,
    standingBody: { width: 16, height: 32, offsetX: 8, offsetY: 8 },
  },
  enemy: {
    speed: 80,
    patrolRange: 200,
    detectionRange: 300,
    attackRange: 150,
  },
  projectile: {
    speed: 500,
    spreadSpeed: 450,
    laserSpeed: 800,
    fireSpeed: 300,
  },
  camera: {
    deadzone: { x: 80, y: 60 },
    lerp: { x: 0.1, y: 0.1 },
    shakeDuration: 200,
    shakeIntensity: 0.01,
  },
  collision: {
    maxConcurrentEnemies: 12,
    maxPooledBullets: 60,
    maxParticleEmitters: 8,
  },
} as const;