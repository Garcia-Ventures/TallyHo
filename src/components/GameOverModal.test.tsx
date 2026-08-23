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
  Badge: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
}));

vi.mock('react-native', () => ({
  Modal: ({ children, visible }: { children: React.ReactNode; visible?: boolean }) =>
    visible ? <div>{children}</div> : null,
  View: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
  ScrollView: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
}));

vi.mock('../services/audio', () => ({
  nativeSound: {
    playVictoryFanfare: vi.fn(),
  },
}));

vi.mock('./AdBannerCard', () => ({
  AdBannerCard: () => <div>AdBanner</div>,
}));

vi.mock('./ScreenContainer', () => ({
  ScreenContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { GameSession } from '../types/game';
import { GameOverModal } from './GameOverModal';

describe('GameOverModal Component', () => {
  const mockGame: GameSession = {
    id: 'game_go',
    name: 'Championship Match',
    scoringMode: 'RACE_HIGH',
    roundScoringType: 'EVERY_PLAYER',
    targetScore: 100,
    status: 'COMPLETED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    players: [
      { id: 'p1', name: 'Winner Alice', initials: 'A', color: '#E5A93C' },
      { id: 'p2', name: 'Second Bob', initials: 'B', color: '#6A9C78' },
      { id: 'p3', name: 'Third Charlie', initials: 'C', color: '#D96B43' },
      { id: 'p4', name: 'Fourth David', initials: 'D', color: '#3B5998' },
    ],
    rounds: [
      {
        roundNumber: 1,
        timestamp: new Date().toISOString(),
        scores: {
          p1: { playerId: 'p1', points: 100 },
          p2: { playerId: 'p2', points: 80 },
          p3: { playerId: 'p3', points: 60 },
          p4: { playerId: 'p4', points: 40 },
        },
      },
    ],
  };

  it('returns null when isOpen is false', () => {
    const html = renderToString(<GameOverModal isOpen={false} onClose={vi.fn()} game={mockGame} onRematch={vi.fn()} />);
    expect(html).toBe('');
  });

  it('renders champion banner, podium (1st, 2nd, 3rd), and 4th place standings when open', () => {
    const html = renderToString(<GameOverModal isOpen={true} onClose={vi.fn()} game={mockGame} onRematch={vi.fn()} />);

    expect(html).toContain('Winner Alice');
    expect(html).toContain('Second Bob');
    expect(html).toContain('Third Charlie');
    expect(html).toContain('Fourth David');
    expect(html).toContain('🔄 Rematch');
  });

  it('renders correctly as route modal without outer Modal element', () => {
    const html = renderToString(
      <GameOverModal isOpen={true} onClose={vi.fn()} game={mockGame} onRematch={vi.fn()} isRouteModal={true} />,
    );

    expect(html).toContain('Championship Match');
    expect(html).toContain('Winner Alice');
  });
});
