import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@gv-tech/ui-native', () => ({
  Button: ({ children, onPress, ...props }: React.ComponentProps<'button'> & { onPress?: () => void }) => (
    <button onClick={onPress} {...props}>
      {children}
    </button>
  ),
  Card: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
}));

vi.mock('react-native', () => ({
  View: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
  Pressable: ({ children, onPress, ...props }: React.ComponentProps<'button'> & { onPress?: () => void }) => (
    <button onClick={onPress} {...props}>
      {children}
    </button>
  ),
  ScrollView: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
}));

vi.mock('./ScreenContainer', () => ({
  ScreenContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { GameSession } from '../types/game';
import { PlayModeView } from './PlayModeView';

describe('PlayModeView Component', () => {
  const mockGame: GameSession = {
    id: 'game_pm',
    name: 'Play Mode Match',
    scoringMode: 'RACE_HIGH',
    roundScoringType: 'EVERY_PLAYER',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    players: [
      { id: 'p1', name: 'Alice', initials: 'A', color: '#E5A93C' },
      { id: 'p2', name: 'Bob', initials: 'B', color: '#6A9C78' },
    ],
    rounds: [
      {
        roundNumber: 1,
        timestamp: new Date().toISOString(),
        scores: {},
      },
    ],
  };

  it('renders active player turn, keypad, and action buttons', () => {
    const onScoreSubmitted = vi.fn();
    const onFlipToDashboard = vi.fn();
    const onEndMatch = vi.fn();

    const html = renderToString(
      <PlayModeView
        game={mockGame}
        onScoreSubmitted={onScoreSubmitted}
        onFlipToDashboard={onFlipToDashboard}
        onEndMatch={onEndMatch}
      />,
    );

    expect(html).toContain('Alice');
    expect(html).toContain('Bob');
    expect(html).toContain('Submit Round Score');
    expect(html).toContain('📋 Dashboard');
  });
});
