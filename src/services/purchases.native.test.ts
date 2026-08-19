import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockNativePurchases, mockRevenueCatUI } = vi.hoisted(() => {
  return {
    mockNativePurchases: {
      configure: vi.fn(),
      setLogLevel: vi.fn(),
      getOfferings: vi.fn(),
      getCustomerInfo: vi.fn(),
      purchasePackage: vi.fn(),
      restorePurchases: vi.fn(),
      logIn: vi.fn(),
    },
    mockRevenueCatUI: {
      presentPaywallIfNeeded: vi.fn(),
    },
  };
});

vi.mock('react-native-purchases', () => ({
  default: mockNativePurchases,
  LOG_LEVEL: { DEBUG: 'DEBUG' },
  PURCHASES_ERROR_CODE: { PURCHASE_CANCELLED_ERROR: '1' },
}));

vi.mock('react-native-purchases-ui', () => ({
  default: mockRevenueCatUI,
  PAYWALL_RESULT: { PURCHASED: 'PURCHASED', RESTORED: 'RESTORED', CANCELLED: 'CANCELLED' },
}));

vi.mock('react-native', () => ({
  Platform: { OS: 'android' },
  Linking: {
    canOpenURL: vi.fn().mockResolvedValue(true),
    openURL: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('./analytics', () => ({
  trackEvent: vi.fn(),
}));

import {
  getCustomerInfo,
  getOfferings,
  initPurchases,
  presentCustomerCenter,
  purchasePackageByIdentifier,
  restoreAdFreePurchases,
} from './purchases.native';

describe('purchases.native service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes native purchases with API key and log level', async () => {
    await initPurchases();
    expect(mockNativePurchases.configure).toHaveBeenCalled();
  });

  it('fetches customer info', async () => {
    const mockInfo = { entitlements: { active: { 'TallyHo Pro': {} } } };
    mockNativePurchases.getCustomerInfo.mockResolvedValueOnce(mockInfo);

    const info = await getCustomerInfo();
    expect(info).toEqual(mockInfo);
  });

  it('fetches native offerings', async () => {
    const mockOfferings = {
      current: {
        identifier: 'default',
        availablePackages: [
          { identifier: 'com.gventureshq.tallyho.lifetime', packageType: 'LIFETIME' },
          { identifier: 'com.gventureshq.tallyho.yearly', packageType: 'ANNUAL' },
          { identifier: 'com.gventureshq.tallyho.monthly', packageType: 'MONTHLY' },
        ],
      },
    };
    mockNativePurchases.getOfferings.mockResolvedValueOnce(mockOfferings);

    const offerings = await getOfferings();
    expect(offerings?.current?.availablePackages.length).toBe(3);
  });

  it('purchases a package tier successfully', async () => {
    const mockPkg = { identifier: 'com.gventureshq.tallyho.lifetime', packageType: 'LIFETIME' };
    mockNativePurchases.getOfferings.mockResolvedValueOnce({
      current: {
        identifier: 'default',
        lifetime: mockPkg,
        availablePackages: [mockPkg],
      },
    });
    mockNativePurchases.purchasePackage.mockResolvedValueOnce({
      customerInfo: { entitlements: { active: { 'TallyHo Pro': {} } } },
    });

    const result = await purchasePackageByIdentifier('lifetime');
    expect(result.success).toBe(true);
    expect(result.isPro).toBe(true);
  });

  describe('restoreAdFreePurchases on Native', () => {
    it('restores automatically when active Google Play receipt exists', async () => {
      mockNativePurchases.restorePurchases.mockResolvedValueOnce({
        entitlements: { active: { 'TallyHo Pro': {} } },
      });

      const result = await restoreAdFreePurchases();
      expect(result.success).toBe(true);
      expect(result.isPro).toBe(true);
      expect(mockNativePurchases.restorePurchases).toHaveBeenCalled();
    });

    it('returns needsEmail: true when no Google Play receipt is found', async () => {
      mockNativePurchases.restorePurchases.mockResolvedValueOnce({
        entitlements: { active: {} },
      });

      const result = await restoreAdFreePurchases();
      expect(result.success).toBe(false);
      expect(result.isPro).toBe(false);
      expect(result.needsEmail).toBe(true);
    });

    it('restores cross-platform Stripe/Web purchase by logging in with billing email', async () => {
      mockNativePurchases.logIn.mockResolvedValueOnce({
        customerInfo: { entitlements: { active: { 'TallyHo Pro': {} } } },
      });

      const result = await restoreAdFreePurchases('buyer@example.com');
      expect(mockNativePurchases.logIn).toHaveBeenCalledWith('buyer@example.com');
      expect(result.success).toBe(true);
      expect(result.isPro).toBe(true);
    });
  });

  describe('presentCustomerCenter', () => {
    it('opens Google Play subscription management deep link', async () => {
      const { Linking } = await import('react-native');
      mockNativePurchases.getCustomerInfo.mockResolvedValueOnce({ managementURL: null });

      await presentCustomerCenter();
      expect(Linking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('play.google.com/store/account/subscriptions'),
      );
    });
  });
});
