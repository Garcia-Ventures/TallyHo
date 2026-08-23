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
import { ScoreboardView } from './ScoreboardView';

describe('ScoreboardView Component', () => {
  const mockGame: GameSession = {
    id: 'game_sb',
    name: 'Friday Game Night',
    scoringMode: 'RACE_HIGH',
    roundScoringType: 'EVERY_PLAYER',
    targetScore: 250,
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
        scores: {
          p1: { playerId: 'p1', points: 40 },
          // p2 not scored yet
        },
      },
    ],
  };

  it('renders game title, player cards, score statuses, and turn sequence roster', () => {
    const onOpenScoreKeypad = vi.fn();
    const onOpenRoundHistory = vi.fn();
    const onFlipToPlayMode = vi.fn();
    const onEndMatch = vi.fn();
    const onReorderPlayers = vi.fn();

    const html = renderToString(
      <ScoreboardView
        game={mockGame}
        onOpenScoreKeypad={onOpenScoreKeypad}
        onOpenRoundHistory={onOpenRoundHistory}
        onFlipToPlayMode={onFlipToPlayMode}
        onEndMatch={onEndMatch}
        onReorderPlayers={onReorderPlayers}
      />,
    );

    expect(html).toContain('Friday Game Night');
    expect(html).toContain('Alice');
    expect(html).toContain('Bob');
    expect(html).toContain('pts target');
    expect(html).toContain('🎮 Enter Play Mode →');
    expect(html).toContain('✓ Done'); // Alice scored
    expect(html).toContain('+ Score'); // Bob not scored yet
  });
});
