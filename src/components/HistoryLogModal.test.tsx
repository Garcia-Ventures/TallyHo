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

vi.mock('./ScreenContainer', () => ({
  ScreenContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { GameSession } from '../types/game';
import { HistoryLogModal } from './HistoryLogModal';

describe('HistoryLogModal Component', () => {
  it('returns null when isOpen is false', () => {
    const html = renderToString(
      <HistoryLogModal isOpen={false} onClose={vi.fn()} history={[]} onClearHistory={vi.fn()} />,
    );
    expect(html).toBe('');
  });

  it('renders empty history placeholder when no matches are archived', () => {
    const html = renderToString(
      <HistoryLogModal isOpen={true} onClose={vi.fn()} history={[]} onClearHistory={vi.fn()} />,
    );

    expect(html).toContain('No completed matches archived yet.');
  });

  it('renders list of completed match sessions when history is present', () => {
    const mockHistory: GameSession[] = [
      {
        id: 'hist_1',
        name: 'Grand Final Match',
        scoringMode: 'RACE_HIGH',
        roundScoringType: 'EVERY_PLAYER',
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        players: [{ id: 'p1', name: 'Champion Alice', initials: 'A', color: '#E5A93C' }],
        rounds: [
          { roundNumber: 1, timestamp: new Date().toISOString(), scores: { p1: { playerId: 'p1', points: 150 } } },
        ],
      },
    ];

    const html = renderToString(
      <HistoryLogModal isOpen={true} onClose={vi.fn()} history={mockHistory} onClearHistory={vi.fn()} />,
    );

    expect(html).toContain('Grand Final Match');
    expect(html).toContain('Champion Alice');
    expect(html).toContain('Clear All History');
  });
});
