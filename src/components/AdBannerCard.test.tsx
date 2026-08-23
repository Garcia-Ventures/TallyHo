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
}));

vi.mock('react-native', () => ({
  View: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }: React.ComponentProps<'span'>) => <span {...props}>{children}</span>,
  Linking: { openURL: vi.fn() },
  StyleSheet: { create: (styles: unknown) => styles },
  Platform: { OS: 'web' },
}));

vi.mock('lucide-react-native', () => ({
  ExternalLink: () => <svg />,
  Megaphone: () => <svg />,
  Sparkles: () => <svg />,
}));

vi.mock('./RemoveAdsModal', () => ({
  RemoveAdsModal: () => <div id="remove-ads-modal" />,
}));

vi.mock('../services/analytics', () => ({
  trackEvent: vi.fn(),
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

import { AdBannerCard } from './AdBannerCard';

describe('AdBannerCard Component', () => {
  beforeEach(() => {
    mockStoreState = {
      settings: {
        isAdFree: false,
        isAdBlocked: false,
        themeMode: 'system',
        soundEnabled: true,
        hapticsEnabled: true,
        paperGridTexture: true,
      },
    };
  });

  it('renders house ad banner when user is not ad-free', () => {
    const html = renderToString(<AdBannerCard placement="home" />);
    expect(html).toContain('TALLYHO PRO');
  });

  it('returns null and does not render when user isAdFree', () => {
    mockStoreState.settings.isAdFree = true;

    const html = renderToString(<AdBannerCard placement="home" />);
    expect(html).toBe('');
  });
});
