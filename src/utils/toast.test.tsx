import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  StyleSheet: { create: (styles: unknown) => styles },
  Platform: { OS: 'web' },
  View: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
  Pressable: ({ children, onPress, ...props }: React.ComponentProps<'button'> & { onPress?: () => void }) => (
    <button onClick={onPress} {...props}>
      {children}
    </button>
  ),
  useWindowDimensions: () => ({ width: 400 }),
}));

vi.mock('lucide-react-native', () => ({
  CheckCircle2: () => <svg />,
  AlertCircle: () => <svg />,
  Info: () => <svg />,
  X: () => <svg />,
}));

import { AppToaster, dismissToast, showToast } from './toast';

describe('toast utility & AppToaster', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('renders AppToaster container without throwing', () => {
    const html = renderToString(<AppToaster />);
    expect(html).toBeDefined();
  });

  it('dispatches show and dismiss toast events', () => {
    expect(() => {
      showToast('Match saved successfully!', 'Saved to history', 'success', 3000);
      dismissToast('toast_test');
    }).not.toThrow();
  });
});
