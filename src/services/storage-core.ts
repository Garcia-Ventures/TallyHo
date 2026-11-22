import type { GameSession, Player, UserSettings } from '../types/game';
import { DEFAULT_USER_SETTINGS } from '../types/game';
import { logError } from '../utils/logger';
import type { StorageDriver } from './storage-driver';

export const STORAGE_KEYS = {
  activeGame: 'tallyho_active_game',
  matchHistory: 'tallyho_match_history',
  playerLibrary: 'tallyho_player_library',
  settings: 'tallyho_settings',
} as const;

export const STORAGE_KEY_LIST = [
  STORAGE_KEYS.activeGame,
  STORAGE_KEYS.matchHistory,
  STORAGE_KEYS.playerLibrary,
  STORAGE_KEYS.settings,
] as const;

/** Archived matches kept on device. Older rows drop off the end of the list. */
export const MATCH_HISTORY_LIMIT = 50;

const DEFAULT_PLAYERS: Player[] = [
  { id: 'p1', name: 'Player 1', initials: 'P1', color: '#E5A93C' },
  { id: 'p2', name: 'Player 2', initials: 'P2', color: '#6A9C78' },
  { id: 'p3', name: 'Player 3', initials: 'P3', color: '#D96B43' },
  { id: 'p4', name: 'Player 4', initials: 'P4', color: '#3B5998' },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function isSettingsPatch(value: unknown): value is Partial<UserSettings> {
  return isRecord(value);
}

function isMissing(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

function isGameSession(value: unknown): value is GameSession {
  if (!isRecord(value)) {
    return false;
  }
  return typeof value.id === 'string' && Array.isArray(value.players) && Array.isArray(value.rounds);
}

function isPlayer(value: unknown): value is Player {
  if (!isRecord(value)) {
    return false;
  }
  return typeof value.id === 'string' && typeof value.name === 'string';
}

export interface AppStorage {
  getActiveGame: () => GameSession | null;
  saveActiveGame: (game: GameSession) => void;
  clearActiveGame: () => void;
  getMatchHistory: () => GameSession[];
  archiveMatch: (game: GameSession) => void;
  deleteMatch: (gameId: string) => void;
  clearMatchHistory: () => void;
  getPlayerLibrary: () => Player[];
  savePlayerToLibrary: (player: Player) => void;
  deletePlayerFromLibrary: (playerId: string) => void;
  getSettings: () => UserSettings;
  saveSettings: (settings: UserSettings) => void;
  clearAll: () => void;
}

/**
 * Builds the app storage API on top of a synchronous driver.
 *
 * `isReady` gates the default player seed. Native hydration must finish before a missing library is replaced with the
 * starter roster, or a cold start would overwrite the saved roster.
 */
export function createStorage(driver: StorageDriver, isReady: () => boolean = () => true): AppStorage {
  let cachedSettingsRaw: string | null | undefined;
  let cachedSettings: UserSettings | null = null;

  function readJson(key: string): unknown {
    const data = driver.getItem(key);
    if (!data) {
      return null;
    }
    return JSON.parse(data);
  }

  function invalidateSettingsCache(): void {
    cachedSettingsRaw = undefined;
    cachedSettings = null;
  }

  function getMatchHistory(): GameSession[] {
    try {
      const parsed = readJson(STORAGE_KEYS.matchHistory);
      if (isMissing(parsed)) {
        return [];
      }
      if (!Array.isArray(parsed)) {
        logError('Ignored corrupt match history');
        return [];
      }
      return parsed.filter(isGameSession);
    } catch (error) {
      logError('Failed to load match history', error);
      return [];
    }
  }

  function getPlayerLibrary(): Player[] {
    try {
      const parsed = readJson(STORAGE_KEYS.playerLibrary);
      if (Array.isArray(parsed)) {
        return parsed.filter(isPlayer);
      }
      if (!isMissing(parsed)) {
        logError('Ignored corrupt player library');
        return [];
      }
      if (!isReady()) {
        return [];
      }
      driver.setItem(STORAGE_KEYS.playerLibrary, JSON.stringify(DEFAULT_PLAYERS));
      return DEFAULT_PLAYERS;
    } catch (error) {
      logError('Failed to load player library', error);
      return [];
    }
  }

  return {
    getActiveGame: () => {
      try {
        const parsed = readJson(STORAGE_KEYS.activeGame);
        if (isMissing(parsed)) {
          return null;
        }
        if (!isGameSession(parsed)) {
          logError('Ignored corrupt active game');
          return null;
        }
        return parsed;
      } catch (error) {
        logError('Failed to load active game', error);
        return null;
      }
    },

    saveActiveGame: (game) => {
      try {
        driver.setItem(STORAGE_KEYS.activeGame, JSON.stringify(game));
      } catch (error) {
        logError('Failed to save active game', error);
      }
    },

    clearActiveGame: () => {
      try {
        driver.removeItem(STORAGE_KEYS.activeGame);
      } catch (error) {
        logError('Failed to clear active game', error);
      }
    },

    getMatchHistory,

    archiveMatch: (game) => {
      try {
        const updated = [game, ...getMatchHistory().filter((entry) => entry.id !== game.id)].slice(
          0,
          MATCH_HISTORY_LIMIT,
        );
        driver.setItem(STORAGE_KEYS.matchHistory, JSON.stringify(updated));
        driver.removeItem(STORAGE_KEYS.activeGame);
      } catch (error) {
        logError('Failed to archive match', error);
      }
    },

    deleteMatch: (gameId) => {
      try {
        const updated = getMatchHistory().filter((entry) => entry.id !== gameId);
        driver.setItem(STORAGE_KEYS.matchHistory, JSON.stringify(updated));
      } catch (error) {
        logError('Failed to delete match from history', error);
      }
    },

    clearMatchHistory: () => {
      try {
        driver.removeItem(STORAGE_KEYS.matchHistory);
      } catch (error) {
        logError('Failed to clear match history', error);
      }
    },

    getPlayerLibrary,

    savePlayerToLibrary: (player) => {
      try {
        const library = getPlayerLibrary();
        const existingIdx = library.findIndex((entry) => entry.name.toLowerCase() === player.name.toLowerCase());
        const updated =
          existingIdx >= 0
            ? library.map((entry, index) => (index === existingIdx ? player : entry))
            : [player, ...library];
        driver.setItem(STORAGE_KEYS.playerLibrary, JSON.stringify(updated));
      } catch (error) {
        logError('Failed to save player to library', error);
      }
    },

    deletePlayerFromLibrary: (playerId) => {
      try {
        const library = getPlayerLibrary().filter((entry) => entry.id !== playerId);
        driver.setItem(STORAGE_KEYS.playerLibrary, JSON.stringify(library));
      } catch (error) {
        logError('Failed to delete player from library', error);
      }
    },

    getSettings: () => {
      try {
        const data = driver.getItem(STORAGE_KEYS.settings);
        if (cachedSettings && cachedSettingsRaw === data) {
          return cachedSettings;
        }
        const parsed: unknown = data ? JSON.parse(data) : null;
        const value: UserSettings = isSettingsPatch(parsed)
          ? { ...DEFAULT_USER_SETTINGS, ...parsed }
          : { ...DEFAULT_USER_SETTINGS };
        cachedSettingsRaw = data;
        cachedSettings = value;
        return value;
      } catch (error) {
        logError('Failed to load settings', error);
        return { ...DEFAULT_USER_SETTINGS };
      }
    },

    saveSettings: (settings) => {
      try {
        invalidateSettingsCache();
        driver.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
      } catch (error) {
        logError('Failed to save settings', error);
      }
    },

    clearAll: () => {
      try {
        invalidateSettingsCache();
        driver.removeItem(STORAGE_KEYS.activeGame);
        driver.removeItem(STORAGE_KEYS.matchHistory);
        driver.removeItem(STORAGE_KEYS.playerLibrary);
        driver.removeItem(STORAGE_KEYS.settings);
      } catch (error) {
        logError('Failed to clear storage', error);
      }
    },
  };
}
