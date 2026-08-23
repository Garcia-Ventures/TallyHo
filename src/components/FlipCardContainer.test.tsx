import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  View: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
}));

vi.mock('react-native-reanimated', () => ({
  default: {
    View: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
  useSharedValue: vi.fn((val: unknown) => ({ value: val })),
  useAnimatedStyle: vi.fn(() => ({})),
  withTiming: vi.fn(),
  interpolate: vi.fn((_val: unknown, _from: unknown, to: number[]) => to[0]),
  Easing: {
    inOut: vi.fn(),
    cubic: vi.fn(),
  },
}));

import { FlipCardContainer } from './FlipCardContainer';

describe('FlipCardContainer Component', () => {
  it('renders front and back components inside animated flip card', () => {
    const html = renderToString(
      <FlipCardContainer
        isFlipped={false}
        frontComponent={<div>Front Face View</div>}
        backComponent={<div>Back Face View</div>}
      />,
    );

    expect(html).toContain('Front Face View');
    expect(html).toContain('Back Face View');
  });
});
