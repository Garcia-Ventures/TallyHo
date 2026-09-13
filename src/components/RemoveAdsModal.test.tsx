import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@gv-tech/ui-native', () => ({
  Button: ({ children, onPress, ...props }: React.ComponentProps<'button'> & { onPress?: () => void }) => (
    <button onClick={onPress} {...props}>
      {children}
    </button>
  ),
  Card: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
  Badge: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
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
  Platform: { OS: 'web' },
  Alert: { alert: vi.fn() },
  StyleSheet: { create: (styles: unknown) => styles },
}));

vi.mock('lucide-react-native', () => ({
  AlertCircle: () => <svg />,
  Check: () => <svg />,
  CheckCircle2: () => <svg />,
  Crown: () => <svg />,
  Headphones: () => <svg />,
  Mail: () => <svg />,
  ShieldCheck: () => <svg />,
  Sparkles: () => <svg />,
  X: () => <svg />,
  Zap: () => <svg />,
}));

vi.mock('../services/purchases', () => ({
  getOfferings: vi.fn().mockResolvedValue(null),
  presentCustomerCenter: vi.fn().mockResolvedValue(true),
  purchasePackageByIdentifier: vi.fn().mockResolvedValue({ success: true, isPro: true }),
  restoreAdFreePurchases: vi.fn().mockResolvedValue({ success: true, isPro: true }),
}));

vi.mock('../services/audio', () => ({
  nativeSound: {
    playToggle: vi.fn(),
    playNavigationTap: vi.fn(),
    playVictoryFanfare: vi.fn(),
  },
}));

vi.mock('../services/analytics', () => ({
  trackEvent: vi.fn(),
}));

vi.mock('../utils/toast', () => ({
  showToast: vi.fn(),
}));

vi.mock('./RestorePurchaseModal', () => ({
  RestorePurchaseModal: () => <div id="restore-purchase-modal" />,
}));

let mockStoreState = {
  settings: {
    isAdFree: false,
    isAdBlocked: false,
    themeMode: 'system' as const,
    soundEnabled: true,
    hapticsEnabled: true,
    paperGridTexture: true,
  },
  resetAdFreeStatus: vi.fn(),
  purchaseRemoveAds: vi.fn(),
};

vi.mock('../stores/useSettingsStore', () => ({
  useSettingsStore: Object.assign(
    (selector?: (s: typeof mockStoreState) => unknown) => (selector ? selector(mockStoreState) : mockStoreState),
    {
      getState: () => mockStoreState,
      setState: (partial: Partial<typeof mockStoreState>) => {
        mockStoreState = { ...mockStoreState, ...partial };
      },
    },
  ),
}));

import { purchasePackageByIdentifier, restoreAdFreePurchases } from '../services/purchases';
import { RemoveAdsModal } from './RemoveAdsModal';

describe('RemoveAdsModal Component', () => {
  beforeEach(() => {
    vi.stubGlobal('__DEV__', true);
    mockStoreState = {
      settings: {
        isAdFree: false,
        isAdBlocked: false,
        themeMode: 'system',
        soundEnabled: true,
        hapticsEnabled: true,
        paperGridTexture: true,
      },
      resetAdFreeStatus: vi.fn(),
      purchaseRemoveAds: vi.fn(),
    };
  });

  it('returns null when isOpen is false', () => {
    const html = renderToString(<RemoveAdsModal isOpen={false} onClose={vi.fn()} />);
    expect(html).toBe('');
  });

  it('renders paywall options (Lifetime, Yearly, Monthly) when open', () => {
    const html = renderToString(<RemoveAdsModal isOpen={true} onClose={vi.fn()} />);

    expect(html).toContain('Lifetime Access');
    expect(html).toContain('Yearly Pro');
    expect(html).toContain('Monthly Pro');
    expect(html).toContain('BEST VALUE');
  });

  it('renders manage subscription action when user is already adFree', () => {
    mockStoreState.settings.isAdFree = true;

    const html = renderToString(<RemoveAdsModal isOpen={true} onClose={vi.fn()} />);
    expect(html).toContain('Manage Subscription &amp; Billing');
  });

  it('recovers via restore when purchase reports already-owned (TALLYHO-P)', async () => {
    const onClose = vi.fn();
    vi.mocked(purchasePackageByIdentifier).mockResolvedValueOnce({
      success: false,
      isPro: false,
      alreadyOwned: true,
      error: 'This product is already active on your account.',
    });
    vi.mocked(restoreAdFreePurchases).mockResolvedValueOnce({ success: true, isPro: true });

    render(<RemoveAdsModal isOpen={true} onClose={onClose} />);

    // Web flow requires a billing email before checkout.
    fireEvent.change(screen.getByPlaceholderText('your.email@example.com'), {
      target: { value: 'buyer@example.com' },
    });
    fireEvent.click(screen.getByText('Unlock TallyHo Pro ($4.99)'));

    await waitFor(() => {
      expect(restoreAdFreePurchases).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
