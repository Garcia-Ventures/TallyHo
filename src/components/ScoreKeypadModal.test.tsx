import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@gv-tech/ui-native', () => ({
  Button: ({
    children,
    onPress,
    testID,
    ...props
  }: React.ComponentProps<'button'> & { onPress?: () => void; testID?: string }) => {
    return (
      <button onClick={onPress} data-testid={testID} {...props}>
        {children}
      </button>
    );
  },
  Card: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
}));

vi.mock('react-native', () => ({
  Modal: ({ children, visible }: { children: React.ReactNode; visible?: boolean }) =>
    visible ? <div>{children}</div> : null,
  View: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
}));

vi.mock('../services/audio', () => ({
  nativeSound: {
    playKeypadTap: vi.fn(),
    playKeypadClear: vi.fn(),
    playRoundSubmit: vi.fn(),
  },
}));

import { Player } from '../types/game';
import { ScoreKeypadModal } from './ScoreKeypadModal';

describe('ScoreKeypadModal Component', () => {
  const mockPlayer: Player = {
    id: 'p1',
    name: 'Alice',
    color: '#E5A93C',
    initials: 'A',
  };

  it('returns null when isOpen is false', () => {
    const html = renderToString(
      <ScoreKeypadModal isOpen={false} onClose={vi.fn()} player={mockPlayer} onSubmitScore={vi.fn()} />,
    );
    expect(html).toBe('');
  });

  it('renders modal tree when isOpen is true', () => {
    const handleClose = vi.fn();
    const handleSubmit = vi.fn();

    const html = renderToString(
      <ScoreKeypadModal isOpen={true} onClose={handleClose} player={mockPlayer} onSubmitScore={handleSubmit} />,
    );

    expect(html).toContain('Alice');
    expect(html).toContain('Save Round Score');
  });

  it('renders correctly as route modal without Modal wrapper', () => {
    const html = renderToString(
      <ScoreKeypadModal
        isOpen={true}
        onClose={vi.fn()}
        player={mockPlayer}
        onSubmitScore={vi.fn()}
        isRouteModal={true}
      />,
    );

    expect(html).toContain('Alice');
    expect(html).toContain('Save Round Score');
  });
});
