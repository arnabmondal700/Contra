// config/PlayerAnimations.ts
import Phaser from "phaser";

export function createPlayerAnimations(scene: Phaser.Scene, textureKey: string = "player"): void {
  const anims = scene.anims;

  const def = (
    key: string,
    start: number,
    end: number,
    frameRate: number,
    repeat: number
  ): void => {
    if (anims.exists(key)) return;
    anims.create({
      key,
      frames: anims.generateFrameNumbers(textureKey, { start, end }),
      frameRate,
      repeat,
    });
  };

  def("player-idle", 0, 3, 6, -1);
  def("player-run", 4, 9, 12, -1);
  def("player-jump-rise", 10, 11, 8, 0);
  def("player-jump-fall", 12, 13, 8, 0);
  def("player-jump-land", 14, 15, 10, 0);
  def("player-crouch-idle", 16, 17, 5, -1);
  def("player-crouch-move", 18, 21, 10, -1);
  def("player-prone", 22, 22, 1, -1);
  def("player-climb", 23, 26, 8, -1);
  def("player-hurt", 27, 27, 1, 0);
  def("player-dead", 28, 30, 6, 0);
  def("player-respawn", 31, 32, 4, 2);
}

export function generatePlaceholderPlayerSpritesheet(scene: Phaser.Scene, textureKey: string = "player"): void {
  if (scene.textures.exists(textureKey)) return;

  const frameWidth = 32;
  const frameHeight = 48;
  const totalFrames = 33;
  const columns = 6;
  const rows = Math.ceil(totalFrames / columns);
  const canvasWidth = columns * frameWidth;
  const canvasHeight = rows * frameHeight;

  const graphics = scene.make.graphics({ x: 0, y: 0 });

  const frameColors: [number, number, number][] = [
    [0, 3, 0x4488ff],
    [4, 9, 0x44aaff],
    [10, 11, 0x66ccff],
    [12, 13, 0x88ddff],
    [14, 15, 0x66aadd],
    [16, 17, 0x336699],
    [18, 21, 0x225577],
    [22, 22, 0x224466],
    [23, 26, 0x88aa44],
    [27, 27, 0xff4444],
    [28, 30, 0x884444],
    [31, 32, 0x44ff88],
  ];

  const getColor = (frameIndex: number): number => {
    for (const [start, end, color] of frameColors) {
      if (frameIndex >= start && frameIndex <= end) return color;
    }
    return 0x4488ff;
  };

  const getBodyHeight = (frameIndex: number): number => {
    if (frameIndex >= 16 && frameIndex <= 21) return 24;
    if (frameIndex === 22) return 12;
    return frameHeight;
  };

  const getBodyY = (frameIndex: number): number => {
    if (frameIndex >= 16 && frameIndex <= 21) return 14;
    if (frameIndex === 22) return 28;
    return 4;
  };

  for (let i = 0; i < totalFrames; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const baseX = col * frameWidth;
    const baseY = row * frameHeight;
    const color = getColor(i);
    const bodyH = getBodyHeight(i);
    const bodyY = getBodyY(i);

    graphics.fillStyle(color, 1);
    graphics.fillRect(baseX + 8, baseY + bodyY, 16, bodyH);

    const headColor = (i >= 28 && i <= 30) ? 0x884444 : 0xffccaa;
    graphics.fillStyle(headColor, 1);
    graphics.fillRect(baseX + 10, baseY, 12, 8);

    graphics.fillStyle(0x333333, 1);
    graphics.fillRect(baseX + 24, baseY + bodyY + 4, 8, 3);

    if (i <= 15) {
      graphics.fillStyle(0x000000, 0.3);
      const legOffset = (i >= 4 && i <= 9) ? ((i - 4) % 3 - 1) * 2 : 0;
      graphics.fillRect(baseX + 8, baseY + bodyY + bodyH - 6, 6, 6);
      graphics.fillRect(baseX + 18, baseY + bodyY + bodyH - 6 + legOffset, 6, 6);
    }
  }

  graphics.generateTexture(textureKey, canvasWidth, canvasHeight);
  graphics.destroy();
}