import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  Dimensions: { get: () => ({ width: 400, height: 800 }) },
  View: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
}));

vi.mock('react-native-reanimated', () => ({
  default: {
    View: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
  useSharedValue: vi.fn((val: unknown) => ({ value: val })),
  useAnimatedStyle: vi.fn(() => ({})),
  withTiming: vi.fn(),
  withDelay: vi.fn(),
}));

import { ConfettiCelebration } from './ConfettiCelebration';

describe('ConfettiCelebration Component', () => {
  it('renders confetti celebration particles without crashing', () => {
    const html = renderToString(<ConfettiCelebration />);
    expect(html).toContain('class="absolute inset-0 z-50 overflow-hidden"');
  });
});
