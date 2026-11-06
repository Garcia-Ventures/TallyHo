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
  PURCHASES_ERROR_CODE: {
    PURCHASE_CANCELLED_ERROR: '1',
    PRODUCT_ALREADY_PURCHASED_ERROR: 'PRODUCT_ALREADY_PURCHASED_ERROR',
  },
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

vi.mock('../utils/logger', () => ({
  logError: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
}));

import { logError, logInfo } from '../utils/logger';
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

  describe('already-owned recovery (TALLYHO-P)', () => {
    const mockPkg = { identifier: 'com.gventureshq.tallyho.lifetime', packageType: 'LIFETIME' };
    const offeringsPayload = {
      current: {
        identifier: 'default',
        lifetime: mockPkg,
        availablePackages: [mockPkg],
      },
    };

    it('recovers via restore when the store reports already-purchased by code', async () => {
      mockNativePurchases.getOfferings.mockResolvedValueOnce(offeringsPayload);
      mockNativePurchases.purchasePackage.mockRejectedValueOnce({
        code: 'PRODUCT_ALREADY_PURCHASED_ERROR',
        message: 'This product is already active for the user.',
      });
      mockNativePurchases.restorePurchases.mockResolvedValueOnce({
        entitlements: { active: { 'TallyHo Pro': {} } },
      });

      const result = await purchasePackageByIdentifier('lifetime');
      expect(mockNativePurchases.restorePurchases).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.isPro).toBe(true);
    });

    it('recovers via restore when the store reports already-active by message only', async () => {
      mockNativePurchases.getOfferings.mockResolvedValueOnce(offeringsPayload);
      mockNativePurchases.purchasePackage.mockRejectedValueOnce({
        code: 'UNKNOWN',
        message: 'This product is already active for the user.',
      });
      mockNativePurchases.restorePurchases.mockResolvedValueOnce({
        entitlements: { active: { 'TallyHo Pro': {} } },
      });

      const result = await purchasePackageByIdentifier('lifetime');
      expect(result.success).toBe(true);
      expect(result.isPro).toBe(true);
    });

    it('returns alreadyOwned when restore finds no entitlement', async () => {
      mockNativePurchases.getOfferings.mockResolvedValueOnce(offeringsPayload);
      mockNativePurchases.purchasePackage.mockRejectedValueOnce({
        code: 'PRODUCT_ALREADY_PURCHASED_ERROR',
        message: 'Already owned.',
      });
      mockNativePurchases.restorePurchases.mockResolvedValueOnce({
        entitlements: { active: {} },
      });

      const result = await purchasePackageByIdentifier('lifetime');
      expect(result.success).toBe(false);
      expect(result.alreadyOwned).toBe(true);
      expect(result.error).toContain('Restore');
    });
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

  describe('expected store states stay out of Sentry (TALLYHO-Q/R)', () => {
    const mockPkg = { identifier: 'com.gventureshq.tallyho.lifetime', packageType: 'LIFETIME' };
    const offeringsPayload = {
      current: {
        identifier: 'default',
        lifetime: mockPkg,
        availablePackages: [mockPkg],
      },
    };

    it('returns null without logError when Offerings fetch fails with a network request error', async () => {
      vi.mocked(logError).mockClear();
      mockNativePurchases.getOfferings.mockRejectedValueOnce(new Error('Error performing request.'));

      const offerings = await getOfferings();

      expect(offerings).toBeNull();
      expect(logError).not.toHaveBeenCalled();
      expect(logInfo).toHaveBeenCalled();
    });

    it('returns a friendly error without logError when purchases are not allowed on the device', async () => {
      vi.mocked(logError).mockClear();
      mockNativePurchases.getOfferings.mockResolvedValueOnce(offeringsPayload);
      mockNativePurchases.purchasePackage.mockRejectedValueOnce(
        new Error('The device or user is not allowed to make the purchase.'),
      );

      const result = await purchasePackageByIdentifier('lifetime');

      expect(result.success).toBe(false);
      expect(result.userCancelled).not.toBe(true);
      expect(result.alreadyOwned).not.toBe(true);
      expect(result.error).toContain('not allowed');
      expect(logError).not.toHaveBeenCalled();
    });

    it('still logs unexpected purchase failures to Sentry', async () => {
      vi.mocked(logError).mockClear();
      mockNativePurchases.getOfferings.mockResolvedValueOnce(offeringsPayload);
      mockNativePurchases.purchasePackage.mockRejectedValueOnce(new Error('Null is not an object'));

      const result = await purchasePackageByIdentifier('lifetime');

      expect(result.success).toBe(false);
      expect(logError).toHaveBeenCalled();
    });
  });
});
