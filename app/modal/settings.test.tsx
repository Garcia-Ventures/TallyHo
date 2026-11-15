import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('expo-router', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn() }),
}));

vi.mock('lucide-react-native', () => ({
  ExternalLink: () => null,
  HelpCircle: () => null,
  ShieldCheck: () => null,
  Trash2: () => null,
}));

vi.mock('react-native', () => ({
  Alert: {
    alert: (_title: string, _message?: string, buttons?: { text?: string; onPress?: () => void }[]) => {
      buttons?.find((button) => button.text === 'Erase Everything')?.onPress?.();
    },
  },
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
  CardDescription: ({ children }: { children?: React.ReactNode }) => <p>{children}</p>,
  CardHeader: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children?: React.ReactNode }) => <h2>{children}</h2>,
  Text: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock('../../src/components/AdBannerCard', () => ({
  AdBannerCard: () => null,
}));

vi.mock('../../src/components/ScreenContainer', () => ({
  ScreenContainer: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../src/utils/toast', () => ({
  showToast: vi.fn(),
}));

import { SettingsDataSection } from '../../src/components/settings/SettingsDataSection';
import { storage } from '../../src/services/storage';
import { useGameStore } from '../../src/stores/useGameStore';
import { usePlayerLibraryStore } from '../../src/stores/usePlayerLibraryStore';
import { useSettingsStore } from '../../src/stores/useSettingsStore';
import { DEFAULT_USER_SETTINGS } from '../../src/types/game';
import HomeScreen from '../index';

const player = { id: 'p1', name: 'Ada', initials: 'A', color: '#E5A93C' };

describe('settings erase', () => {
  beforeEach(() => {
    storage.clearAll();
    useGameStore.setState({ activeGame: null, matchHistory: [], isPlayMode: false });
    usePlayerLibraryStore.setState({ players: [] });
    useSettingsStore.setState({ settings: DEFAULT_USER_SETTINGS });
  });

  it('clears the home resume banner and recent-match list', () => {
    useGameStore.getState().createGame({
      name: 'Friday Night',
      scoringMode: 'RACE_HIGH',
      roundScoringType: 'EVERY_PLAYER',
      targetScore: 500,
      players: [player],
    });
    useGameStore.getState().endMatchManually();
    useGameStore.getState().createGame({
      name: 'Still Playing',
      scoringMode: 'RACE_HIGH',
      roundScoringType: 'EVERY_PLAYER',
      targetScore: 500,
      players: [player],
    });
    usePlayerLibraryStore.getState().savePlayer({ id: 'z', name: 'Ziggy', initials: 'Z', color: '#111111' });
    useSettingsStore.getState().updateSettings({ themeMode: 'dark' });

    render(<SettingsDataSection />);
    fireEvent.click(screen.getByRole('button', { name: 'Reset Local Storage & Settings' }));

    expect(useGameStore.getState().activeGame).toBeNull();
    expect(useGameStore.getState().matchHistory).toEqual([]);
    expect(usePlayerLibraryStore.getState().players.map((entry) => entry.name)).toEqual([
      'Player 1',
      'Player 2',
      'Player 3',
      'Player 4',
    ]);
    expect(useSettingsStore.getState().settings.themeMode).toBe('system');

    render(<HomeScreen />);
    expect(screen.queryByText('Friday Night')).toBeNull();
    expect(screen.queryByText('Still Playing')).toBeNull();
    expect(screen.queryByText('▶ Resume Game')).toBeNull();
    expect(screen.getByText('No completed matches yet.')).toBeTruthy();
  });
});
