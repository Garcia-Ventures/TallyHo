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
  Input: ({ ...props }: React.ComponentProps<'input'>) => <input {...props} />,
}));

vi.mock('react-native', () => ({
  Modal: ({ children, visible }: { children: React.ReactNode; visible?: boolean }) =>
    visible ? <div>{children}</div> : null,
  View: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
  ScrollView: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
}));

vi.mock('./ScreenContainer', () => ({
  ScreenContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { GameSession } from '../types/game';
import { RoundHistoryModal } from './RoundHistoryModal';

describe('RoundHistoryModal Component', () => {
  const mockGame: GameSession = {
    id: 'game_rh',
    name: 'Round History Match',
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
        scores: {
          p1: { playerId: 'p1', points: 30 },
          p2: { playerId: 'p2', points: 20 },
        },
      },
    ],
  };

  it('returns null when isOpen is false', () => {
    const html = renderToString(
      <RoundHistoryModal isOpen={false} onClose={vi.fn()} game={mockGame} onUpdateRounds={vi.fn()} />,
    );
    expect(html).toBe('');
  });

  it('renders round list and player scores when open', () => {
    const html = renderToString(
      <RoundHistoryModal isOpen={true} onClose={vi.fn()} game={mockGame} onUpdateRounds={vi.fn()} />,
    );

    expect(html).toContain('Alice');
    expect(html).toContain('Bob');
    expect(html).toContain('30');
    expect(html).toContain('20');
    expect(html).toContain('Edit');
  });
});
