// managers/AudioManager.ts
import Phaser from "phaser";

export class AudioManager {
  private static instance: AudioManager;
  private scene?: Phaser.Scene;
  private musicVolume = 0.8;
  private sfxVolume = 0.8;
  private currentMusicKey: string | null = null;
  private currentMusic?: Phaser.Sound.BaseSound;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  init(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  setMasterVolume(volume: number): void {
    this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
    this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
  }

  playMusic(key: string, opts?: { loop?: boolean; volume?: number; fadeMs?: number }): void {
    if (!this.scene?.sound) return;
    if (this.currentMusicKey === key && this.currentMusic?.isPlaying) return;

    const volume = opts?.volume ?? this.musicVolume;
    const fadeMs = opts?.fadeMs ?? 0;

    if (this.currentMusic?.isPlaying) {
      if (fadeMs > 0) {
        this.scene.tweens.add({
          targets: this.currentMusic,
          volume: 0,
          duration: fadeMs,
          onComplete: () => {
            this.currentMusic?.stop();
          },
        });
        return;
      }
      this.currentMusic.stop();
    }

    this.currentMusicKey = key;
    const sound = this.scene.sound.add(key, { loop: opts?.loop ?? true, volume });
    sound.play();
    this.currentMusic = sound;
  }

  playSfx(key: string, volume?: number): void {
    if (!this.scene?.sound) return;
    const v = volume ?? this.sfxVolume;
    if (v <= 0) return;
    this.scene.sound.play(key, { volume: v });
  }

  resumeAudioContext(): void {
    if (typeof window === "undefined") return;
    const AudioContextConstructor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;
    const audioContext = new AudioContextConstructor();
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
  }

  stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = undefined;
      this.currentMusicKey = null;
    }
  }
}