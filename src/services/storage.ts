import { GameSession, Player, UserSettings } from '../types/game';

const KEYS = {
  ACTIVE_GAME: 'tallyho_active_game',
  MATCH_HISTORY: 'tallyho_match_history',
  PLAYER_LIBRARY: 'tallyho_player_library',
  USER_SETTINGS: 'tallyho_user_settings',
};

const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  paperGridTexture: true,
};

const DEFAULT_PLAYERS: Player[] = [
  { id: 'p1', name: 'Alex', color: '#E5A93C', initials: 'AL' },
  { id: 'p2', name: 'Jordan', color: '#6A9C78', initials: 'JO' },
  { id: 'p3', name: 'Taylor', color: '#D96B43', initials: 'TA' },
  { id: 'p4', name: 'Morgan', color: '#3B5998', initials: 'MO' },
];

export const storage = {
  // Active Game
  getActiveGame(): GameSession | null {
    try {
      const data = localStorage.getItem(KEYS.ACTIVE_GAME);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveActiveGame(game: GameSession): void {
    try {
      game.updatedAt = new Date().toISOString();
      localStorage.setItem(KEYS.ACTIVE_GAME, JSON.stringify(game));
    } catch (e) {
      console.error('Failed to save active game', e);
    }
  },

  clearActiveGame(): void {
    try {
      localStorage.removeItem(KEYS.ACTIVE_GAME);
    } catch (e) {
      console.error('Failed to clear active game', e);
    }
  },

  // Match History
  getMatchHistory(): GameSession[] {
    try {
      const data = localStorage.getItem(KEYS.MATCH_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveMatchToHistory(game: GameSession): void {
    try {
      const history = storage.getMatchHistory();
      const existingIndex = history.findIndex((item) => item.id === game.id);
      if (existingIndex >= 0) {
        history[existingIndex] = game;
      } else {
        history.unshift(game);
      }
      localStorage.setItem(KEYS.MATCH_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save match history', e);
    }
  },

  deleteMatchFromHistory(id: string): void {
    try {
      const history = storage.getMatchHistory().filter((item) => item.id !== id);
      localStorage.setItem(KEYS.MATCH_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to delete match', e);
    }
  },

  // Player Library
  getPlayerLibrary(): Player[] {
    try {
      const data = localStorage.getItem(KEYS.PLAYER_LIBRARY);
      if (!data) {
        localStorage.setItem(KEYS.PLAYER_LIBRARY, JSON.stringify(DEFAULT_PLAYERS));
        return DEFAULT_PLAYERS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_PLAYERS;
    }
  },

  savePlayerToLibrary(player: Player): void {
    try {
      const library = storage.getPlayerLibrary();
      const existingIndex = library.findIndex(
        (p) => p.id === player.id || p.name.toLowerCase() === player.name.toLowerCase(),
      );
      if (existingIndex >= 0) {
        library[existingIndex] = player;
      } else {
        library.push(player);
      }
      localStorage.setItem(KEYS.PLAYER_LIBRARY, JSON.stringify(library));
    } catch (e) {
      console.error('Failed to save player profile', e);
    }
  },

  deletePlayerFromLibrary(id: string): void {
    try {
      const library = storage.getPlayerLibrary().filter((p) => p.id !== id);
      localStorage.setItem(KEYS.PLAYER_LIBRARY, JSON.stringify(library));
    } catch (e) {
      console.error('Failed to delete player profile', e);
    }
  },

  // User Settings
  getUserSettings(): UserSettings {
    try {
      const data = localStorage.getItem(KEYS.USER_SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveUserSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(KEYS.USER_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save user settings', e);
    }
  },
};
