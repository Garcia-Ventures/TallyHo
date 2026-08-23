import { beforeEach, describe, expect, it } from 'vitest';
import { storage } from '../services/storage';
import { usePlayerLibraryStore } from './usePlayerLibraryStore';

describe('usePlayerLibraryStore', () => {
  beforeEach(() => {
    storage.clearAll();
    usePlayerLibraryStore.setState({ players: [] });
  });

  it('loads default starter player library when storage is empty', () => {
    const store = usePlayerLibraryStore.getState();
    store.loadPlayers();

    const players = usePlayerLibraryStore.getState().players;
    expect(players.length).toBe(4);
    expect(players.map((p) => p.name)).toEqual(['Player 1', 'Player 2', 'Player 3', 'Player 4']);
  });

  it('saves a new player to the library', () => {
    const store = usePlayerLibraryStore.getState();
    store.loadPlayers();

    store.savePlayer({
      id: 'p_new',
      name: 'Maya',
      initials: 'M',
      color: '#9B51E0',
    });

    const updated = usePlayerLibraryStore.getState().players;
    expect(updated.some((p) => p.name === 'Maya')).toBe(true);
  });

  it('updates an existing player when matching name (case-insensitive)', () => {
    const store = usePlayerLibraryStore.getState();
    store.loadPlayers();

    store.savePlayer({
      id: 'p1_updated',
      name: 'player 1', // matches 'Player 1'
      initials: 'P1-Updated',
      color: '#FF0000',
    });

    const updated = usePlayerLibraryStore.getState().players;
    const p1 = updated.find((p) => p.name.toLowerCase() === 'player 1');
    expect(p1?.initials).toBe('P1-Updated');
    expect(p1?.color).toBe('#FF0000');
  });

  it('deletes a player from the library by ID', () => {
    const store = usePlayerLibraryStore.getState();
    store.loadPlayers();

    store.deletePlayer('p1');
    const updated = usePlayerLibraryStore.getState().players;
    expect(updated.some((p) => p.id === 'p1')).toBe(false);
  });
});
