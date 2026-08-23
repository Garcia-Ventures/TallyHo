import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('expo-router', () => ({
  useRouter: () => ({
    canGoBack: () => true,
    back: vi.fn(),
    push: vi.fn(),
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
  Text: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
}));

vi.mock('lucide-react-native', () => ({
  ArrowLeft: () => <svg />,
}));

import { HeaderBackButton } from './HeaderBackButton';

describe('HeaderBackButton Component', () => {
  it('renders back button with label when provided', () => {
    const html = renderToString(<HeaderBackButton label="Back to Setup" />);
    expect(html).toContain('Back to Setup');
    expect(html).toContain('aria-label="Go back"');
  });
});
