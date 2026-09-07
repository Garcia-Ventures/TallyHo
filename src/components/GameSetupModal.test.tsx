import { fireEvent, render, screen } from '@testing-library/react';
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
  Input: ({
    onChangeText,
    onChange,
    ...props
  }: React.ComponentProps<'input'> & { onChangeText?: (text: string) => void }) => (
    <input
      onChange={(e) => {
        onChange?.(e);
        onChangeText?.(e.target.value);
      }}
      {...props}
    />
  ),
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

  it('safely adds a new player when crypto is undefined (React Native Hermes regression test)', () => {
    const originalCrypto = globalThis.crypto;
    const onStartGame = vi.fn();
    try {
      // @ts-expect-error - simulating React Native environment where crypto is not defined
      delete globalThis.crypto;

      render(<GameSetupModal isOpen={true} onClose={vi.fn()} preset={GAME_PRESETS[0]} onStartGame={onStartGame} />);

      const input = screen.getByPlaceholderText('Add player name...');
      fireEvent.change(input, { target: { value: 'Charlie' } });

      const addButton = screen.getByText('+ Add');
      fireEvent.click(addButton);

      expect(screen.getByText('Charlie')).toBeDefined();

      const startButton = screen.getByText('🚀 Start Match');
      fireEvent.click(startButton);

      expect(onStartGame).toHaveBeenCalledTimes(1);
      const passedPlayers = onStartGame.mock.calls[0][0].players;
      expect(passedPlayers.length).toBe(3);
      const newPlayer = passedPlayers.find((p: { name: string }) => p.name === 'Charlie');
      expect(newPlayer).toBeDefined();
      expect(newPlayer.id.startsWith('p_')).toBe(true);
    } finally {
      globalThis.crypto = originalCrypto;
    }
  });
});
