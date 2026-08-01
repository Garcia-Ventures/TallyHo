import { create } from 'zustand';
import { storage } from '../services/storage';
import { Player } from '../types/game';

interface PlayerLibraryState {
  players: Player[];
  loadPlayers: () => void;
  savePlayer: (player: Player) => void;
  deletePlayer: (playerId: string) => void;
}

export const usePlayerLibraryStore = create<PlayerLibraryState>((set) => ({
  players: [],

  loadPlayers: () => {
    const loaded = storage.getPlayerLibrary();
    set({ players: loaded });
  },

  savePlayer: (player) => {
    storage.savePlayerToLibrary(player);
    set({ players: storage.getPlayerLibrary() });
  },

  deletePlayer: (playerId) => {
    storage.deletePlayerFromLibrary(playerId);
    set({ players: storage.getPlayerLibrary() });
  },
}));
