import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const replace = vi.fn();
const back = vi.fn();

vi.mock('expo-router', () => ({
  useRouter: () => ({ replace, back }),
  useLocalSearchParams: () => ({ playerId: 'p1' }),
}));

vi.mock('react-native', () => ({
  View: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../src/components/ScoreKeypadModal', () => ({
  ScoreKeypadModal: ({ onSubmitScore }: { onSubmitScore: (score: { playerId: string; points: number }) => void }) => (
    <button type="button" onClick={() => onSubmitScore({ playerId: 'p1', points: 80 })}>
      Save Round Score
    </button>
  ),
}));

import { storage } from '../../src/services/storage';
import { useGameStore } from '../../src/stores/useGameStore';
import KeypadModalRoute from './keypad';

describe('keypad route', () => {
  beforeEach(() => {
    replace.mockReset();
    back.mockReset();
    storage.clearAll();
    useGameStore.setState({ activeGame: null, matchHistory: [], isPlayMode: false });
    useGameStore.getState().createGame({
      name: 'Race',
      scoringMode: 'RACE_HIGH',
      roundScoringType: 'SINGLE_WINNER',
      targetScore: 50,
      players: [{ id: 'p1', name: 'Ada', initials: 'A', color: '#E5A93C' }],
    });
  });

  it('replaces to the game-over route when the submitted score wins', () => {
    render(<KeypadModalRoute />);
    fireEvent.click(screen.getByRole('button', { name: 'Save Round Score' }));
    expect(replace).toHaveBeenCalledWith('/modal/game-over');
    expect(useGameStore.getState().activeGame?.status).toBe('COMPLETED');
  });
});
