import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('expo-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('react-native', () => ({
  View: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Pressable: ({ children, onPress }: { children?: React.ReactNode; onPress?: () => void }) => (
    <button type="button" onClick={onPress}>
      {children}
    </button>
  ),
}));

vi.mock('@gv-tech/ui-native', () => ({
  Badge: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Button: ({ children, onPress }: { children?: React.ReactNode; onPress?: () => void }) => (
    <button type="button" onClick={onPress}>
      {children}
    </button>
  ),
  Card: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock('../src/components/AdBannerCard', () => ({
  AdBannerCard: () => null,
}));

vi.mock('../src/components/ScreenContainer', () => ({
  ScreenContainer: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

import { storage } from '../src/services/storage';
import { useGameStore } from '../src/stores/useGameStore';
import HomeScreen from './index';

describe('home screen', () => {
  beforeEach(() => {
    storage.clearAll();
    useGameStore.setState({ activeGame: null, matchHistory: [], isPlayMode: false });
  });

  it('shows the resume banner for an active match', () => {
    useGameStore.getState().createGame({
      name: 'Friday Rummy',
      scoringMode: 'RACE_HIGH',
      roundScoringType: 'EVERY_PLAYER',
      targetScore: 500,
      players: [{ id: 'p1', name: 'Ada', initials: 'A', color: '#E5A93C' }],
    });

    render(<HomeScreen />);
    expect(screen.getByText('Friday Rummy')).toBeTruthy();
    expect(screen.getByText('▶ Resume Game')).toBeTruthy();
  });
});
