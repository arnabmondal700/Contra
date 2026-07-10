// main.ts
import Phaser from "phaser";
import { GAME_CONFIG } from "./config/GameConfig";

// Boot the game
const game = new Phaser.Game(GAME_CONFIG);

// Handle window resize
window.addEventListener("resize", () => {
  game.scale.refresh();
});
