// managers/SaveManager.ts
export interface SaveData {
  version: number;
  highScore: number;
  unlockedStages: string[];
  settings: {
    musicVolume: number;
    sfxVolume: number;
    controlScheme: "keyboard" | "gamepad";
  };
  checkpoints: Record<string, { stageId: string; x: number; y: number }>;
}

export interface SettingsData {
  musicVolume: number;
  sfxVolume: number;
  controlScheme: "keyboard" | "gamepad";
}

const CURRENT_VERSION = 1;
const STORAGE_KEY = "contra-clone-save";

export function migrate(raw: Partial<SaveData>): SaveData {
  return {
    version: CURRENT_VERSION,
    highScore: 0,
    unlockedStages: ["stage1"],
    settings: {
      musicVolume: 0.8,
      sfxVolume: 0.8,
      controlScheme: "keyboard",
    },
    checkpoints: {},
    ...raw,
  };
}

export class SaveManager {
  private static instance: SaveManager | null = null;
  private data: SaveData;

  private constructor() {
    const raw = this.readStorage();
    this.data = migrate(raw);
  }

  static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  load(): SaveData {
    return { ...this.data };
  }

  loadSettings(): SettingsData {
    return { ...this.data.settings };
  }

  save(partial: Partial<SaveData>): void {
    this.data = migrate({ ...this.data, ...partial });
    this.writeStorage(this.data);
  }

  saveSettings(settings: Partial<SettingsData>): void {
    this.data.settings = { ...this.data.settings, ...settings };
    this.writeStorage(this.data);
  }

  reset(): void {
    this.data = migrate({});
    this.writeStorage(this.data);
  }

  private readStorage(): Partial<SaveData> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw) as Partial<SaveData>;
    } catch {
      return {};
    }
  }

  private writeStorage(data: SaveData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Quota exceeded or private mode — fail silently
    }
  }
}