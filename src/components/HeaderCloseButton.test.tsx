import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('expo-router', () => ({
  useRouter: () => ({
    back: vi.fn(),
  }),
}));

vi.mock('react-native', () => ({
  Pressable: ({
    children,
    accessibilityLabel,
    ...props
  }: React.ComponentProps<'button'> & { accessibilityLabel?: string }) => (
    <button aria-label={accessibilityLabel} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('lucide-react-native', () => ({
  X: () => <svg />,
}));

import { HeaderCloseButton } from './HeaderCloseButton';

describe('HeaderCloseButton Component', () => {
  it('renders modal close button with accessibility label', () => {
    const html = renderToString(<HeaderCloseButton />);
    expect(html).toContain('aria-label="Close modal"');
  });
});
