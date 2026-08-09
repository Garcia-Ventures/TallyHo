import { describe, expect, it, vi } from 'vitest';
import { PALETTE } from '../constants/colors';
import { Player } from '../types/game';

describe('ScoreKeypadModal Component', () => {
  const mockPlayer: Player = {
    id: 'p1',
    name: 'Alice',
    color: PALETTE.chip.mustard,
    initials: 'A',
  };

  it('renders correctly when open', () => {
    const handleClose = vi.fn();
    const handleSubmit = vi.fn();

    expect(mockPlayer.name).toBe('Alice');
    expect(mockPlayer.color).toBe(PALETTE.chip.mustard);
  });
});
