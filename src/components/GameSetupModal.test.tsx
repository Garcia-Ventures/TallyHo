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
  Pressable: ({ children, onPress, ...props }: React.ComponentProps<'button'> & { onPress?: () => void }) => (
    <button onClick={onPress} {...props}>
      {children}
    </button>
  ),
  ScrollView: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
}));

vi.mock('../services/audio', () => ({
  nativeSound: {
    playKeypadTap: vi.fn(),
    playPresetSelect: vi.fn(),
    playGameStart: vi.fn(),
  },
}));

vi.mock('./ScreenContainer', () => ({
  ScreenContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { GAME_PRESETS } from '../types/game';
import { GameSetupModal } from './GameSetupModal';

describe('GameSetupModal Component', () => {
  it('returns null when isOpen is false', () => {
    const html = renderToString(
      <GameSetupModal isOpen={false} onClose={vi.fn()} preset={null} onStartGame={vi.fn()} />,
    );
    expect(html).toBe('');
  });

  it('renders presets, player roster, and start button when open', () => {
    const html = renderToString(
      <GameSetupModal
        isOpen={true}
        onClose={vi.fn()}
        preset={GAME_PRESETS[0]} // Rummy 500
        onStartGame={vi.fn()}
      />,
    );

    expect(html).toContain('Rummy 500');
    expect(html).toContain('Player 1');
    expect(html).toContain('Player 2');
    expect(html).toContain('Start Match');
  });

  it('renders custom game configuration when preset is null', () => {
    const html = renderToString(<GameSetupModal isOpen={true} onClose={vi.fn()} preset={null} onStartGame={vi.fn()} />);

    expect(html).toContain('Start Match');
  });
});
