import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@gv-tech/ui-native', () => ({
  Button: ({ children, onPress, ...props }: React.ComponentProps<'button'> & { onPress?: () => void }) => (
    <button onClick={onPress} {...props}>
      {children}
    </button>
  ),
  Input: ({ ...props }: React.ComponentProps<'input'>) => <input {...props} />,
  Text: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
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
  ActivityIndicator: () => <div>Loading...</div>,
  StyleSheet: { create: (styles: unknown) => styles },
  Platform: { OS: 'web' },
}));

vi.mock('lucide-react-native', () => ({
  AlertCircle: () => <svg />,
  Mail: () => <svg />,
  Sparkles: () => <svg />,
  X: () => <svg />,
}));

vi.mock('../services/purchases', () => ({
  restoreAdFreePurchases: vi.fn().mockResolvedValue({ success: true, isPro: true }),
}));

vi.mock('../services/analytics', () => ({
  trackEvent: vi.fn(),
}));

import { RestorePurchaseModal } from './RestorePurchaseModal';

describe('RestorePurchaseModal Component', () => {
  it('returns null when isOpen is false', () => {
    const html = renderToString(<RestorePurchaseModal isOpen={false} onClose={vi.fn()} />);
    expect(html).toBe('');
  });

  it('renders restore purchase modal with email input and action buttons when open', () => {
    const html = renderToString(<RestorePurchaseModal isOpen={true} onClose={vi.fn()} />);

    expect(html).toContain('Restore Pro Access');
    expect(html).toContain('Restore TallyHo Pro');
  });
});
