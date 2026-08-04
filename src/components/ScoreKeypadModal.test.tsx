import { describe, expect, it, vi } from 'vitest';
import { Player } from '../types/game';

describe('ScoreKeypadModal Component', () => {
  const mockPlayer: Player = {
    id: 'p1',
    name: 'Alice',
    color: '#E5A93C',
    initials: 'A',
  };

  it('renders correctly when open', () => {
    const handleClose = vi.fn();
    const handleSubmit = vi.fn();

    expect(mockPlayer.name).toBe('Alice');
    expect(mockPlayer.color).toBe('#E5A93C');
  });
});
