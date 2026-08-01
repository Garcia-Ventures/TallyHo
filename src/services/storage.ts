import { GameSession, Player, UserSettings } from '../types/game';

const ACTIVE_GAME_KEY = 'tallyho_active_game';
const MATCH_HISTORY_KEY = 'tallyho_match_history';
const PLAYER_LIBRARY_KEY = 'tallyho_player_library';
const SETTINGS_KEY = 'tallyho_settings';

const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  paperGridTexture: true,
};

export const storage = {
  // Active Game
  getActiveGame: (): GameSession | null => {
    try {
      const data = localStorage.getItem(ACTIVE_GAME_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to load active game', e);
      return null;
    }
  },

  saveActiveGame: (game: GameSession): void => {
    try {
      localStorage.setItem(ACTIVE_GAME_KEY, JSON.stringify(game));
    } catch (e) {
      console.error('Failed to save active game', e);
    }
  },

  clearActiveGame: (): void => {
    try {
      localStorage.removeItem(ACTIVE_GAME_KEY);
    } catch (e) {
      console.error('Failed to clear active game', e);
    }
  },

  // Match History
  getMatchHistory: (): GameSession[] => {
    try {
      const data = localStorage.getItem(MATCH_HISTORY_KEY);
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
      localStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify(updated));
      storage.clearActiveGame();
    } catch (e) {
      console.error('Failed to archive match', e);
    }
  },

  deleteMatch: (gameId: string): void => {
    try {
      const history = storage.getMatchHistory();
      const updated = history.filter((g) => g.id !== gameId);
      localStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete match from history', e);
    }
  },

  // Player Library
  getPlayerLibrary: (): Player[] => {
    try {
      const data = localStorage.getItem(PLAYER_LIBRARY_KEY);
      if (data) {
        return JSON.parse(data);
      }

      // Default starter player library
      const defaultLibrary: Player[] = [
        { id: 'p1', name: 'Eric', initials: 'E', color: '#E5A93C' },
        { id: 'p2', name: 'Noah', initials: 'N', color: '#6A9C78' },
        { id: 'p3', name: 'Sophia', initials: 'S', color: '#D96B43' },
        { id: 'p4', name: 'Lucas', initials: 'L', color: '#3B5998' },
      ];
      localStorage.setItem(PLAYER_LIBRARY_KEY, JSON.stringify(defaultLibrary));
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

      localStorage.setItem(PLAYER_LIBRARY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save player to library', e);
    }
  },

  deletePlayerFromLibrary: (playerId: string): void => {
    try {
      const library = storage.getPlayerLibrary();
      const updated = library.filter((p) => p.id !== playerId);
      localStorage.setItem(PLAYER_LIBRARY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete player from library', e);
    }
  },

  // Settings
  getSettings: (): UserSettings => {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
      console.error('Failed to load settings', e);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: (settings: UserSettings): void => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },
};
