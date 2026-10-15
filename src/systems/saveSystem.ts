import { SaveGameData } from '../types/game';

const SAVE_KEY = 'hubiq_life_save_v1';

export class SaveSystem {
  public static hasSave(): boolean {
    try {
      return localStorage.getItem(SAVE_KEY) !== null;
    } catch {
      return false;
    }
  }

  public static saveGame(data: SaveGameData): boolean {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(SAVE_KEY, serialized);
      return true;
    } catch (e) {
      console.warn('Failed to save game to localStorage:', e);
      return false;
    }
  }

  public static loadGame(): SaveGameData | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as SaveGameData;
      if (!parsed || !parsed.character || !parsed.stats) return null;
      return parsed;
    } catch (e) {
      console.warn('Failed to parse save game data:', e);
      return null;
    }
  }

  public static clearSave(): void {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // ignore
    }
  }
}
