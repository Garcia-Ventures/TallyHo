import { GameSession, Player, UserSettings } from '../types/game';

const ACTIVE_GAME_KEY = 'tallyho_active_game';
const MATCH_HISTORY_KEY = 'tallyho_match_history';
const PLAYER_LIBRARY_KEY = 'tallyho_player_library';
const SETTINGS_KEY = 'tallyho_settings';

const DEFAULT_SETTINGS: UserSettings = {
  themeMode: 'system',
  soundEnabled: true,
  hapticsEnabled: true,
  paperGridTexture: true,
  customServerUrl: 'https://api.tallyho.app/v1',
};

const memoryStore: Record<string, string> = {};

function getStorageItem(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(key);
  }
  return memoryStore[key] || null;
}

function setStorageItem(key: string, value: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(key, value);
  } else {
    memoryStore[key] = value;
  }
}

function removeStorageItem(key: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(key);
  } else {
    delete memoryStore[key];
  }
}

export const storage = {
  // Active Game
  getActiveGame: (): GameSession | null => {
    try {
      const data = getStorageItem(ACTIVE_GAME_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to load active game', e);
      return null;
    }
  },

  saveActiveGame: (game: GameSession): void => {
    try {
      setStorageItem(ACTIVE_GAME_KEY, JSON.stringify(game));
    } catch (e) {
      console.error('Failed to save active game', e);
    }
  },

  clearActiveGame: (): void => {
    try {
      removeStorageItem(ACTIVE_GAME_KEY);
    } catch (e) {
      console.error('Failed to clear active game', e);
    }
  },

  // Match History
  getMatchHistory: (): GameSession[] => {
    try {
      const data = getStorageItem(MATCH_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load match history', e);
      return [];
    }
  },

  archiveMatch: (game: GameSession): void => {
    try {
      const history = storage.getMatchHistory();
      const updated = [game, ...history.filter((g) => g.id !== game.id)];
      setStorageItem(MATCH_HISTORY_KEY, JSON.stringify(updated));
      storage.clearActiveGame();
    } catch (e) {
      console.error('Failed to archive match', e);
    }
  },

  deleteMatch: (gameId: string): void => {
    try {
      const history = storage.getMatchHistory();
      const updated = history.filter((g) => g.id !== gameId);
      setStorageItem(MATCH_HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete match from history', e);
    }
  },

  // Player Library
  getPlayerLibrary: (): Player[] => {
    try {
      const data = getStorageItem(PLAYER_LIBRARY_KEY);
      if (data) {
        return JSON.parse(data);
      }

      // Default starter player library
      const defaultLibrary: Player[] = [
        { id: 'p1', name: 'Player 1', initials: 'P1', color: '#E5A93C' },
        { id: 'p2', name: 'Player 2', initials: 'P2', color: '#6A9C78' },
        { id: 'p3', name: 'Player 3', initials: 'P3', color: '#D96B43' },
        { id: 'p4', name: 'Player 4', initials: 'P4', color: '#3B5998' },
      ];
      setStorageItem(PLAYER_LIBRARY_KEY, JSON.stringify(defaultLibrary));
      return defaultLibrary;
    } catch (e) {
      console.error('Failed to load player library', e);
      return [];
    }
  },

  savePlayerToLibrary: (player: Player): void => {
    try {
      const library = storage.getPlayerLibrary();
      const existingIdx = library.findIndex((p) => p.name.toLowerCase() === player.name.toLowerCase());
      let updated: Player[];

      if (existingIdx >= 0) {
        updated = [...library];
        updated[existingIdx] = player;
      } else {
        updated = [player, ...library];
      }

      setStorageItem(PLAYER_LIBRARY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save player to library', e);
    }
  },

  deletePlayerFromLibrary: (playerId: string): void => {
    try {
      const library = storage.getPlayerLibrary();
      const updated = library.filter((p) => p.id !== playerId);
      setStorageItem(PLAYER_LIBRARY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete player from library', e);
    }
  },

  // Settings
  getSettings: (): UserSettings => {
    try {
      const data = getStorageItem(SETTINGS_KEY);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
      console.error('Failed to load settings', e);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: (settings: UserSettings): void => {
    try {
      setStorageItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  clearAll: (): void => {
    try {
      removeStorageItem(ACTIVE_GAME_KEY);
      removeStorageItem(MATCH_HISTORY_KEY);
      removeStorageItem(PLAYER_LIBRARY_KEY);
      removeStorageItem(SETTINGS_KEY);
    } catch (e) {
      console.error('Failed to clear storage', e);
    }
  },
};
