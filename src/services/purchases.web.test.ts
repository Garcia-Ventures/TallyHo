import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockPurchases } = vi.hoisted(() => {
  return {
    mockPurchases: {
      getOfferings: vi.fn(),
      getCustomerInfo: vi.fn(),
      purchase: vi.fn(),
      changeUser: vi.fn(),
      setAttributes: vi.fn(),
    },
  };
});

vi.mock('@revenuecat/purchases-js', () => ({
  PackageType: {
    Lifetime: '$rc_lifetime',
    Annual: '$rc_annual',
    Monthly: '$rc_monthly',
  },
  Purchases: {
    configure: vi.fn(() => mockPurchases),
  },
}));

vi.mock('./analytics', () => ({
  trackEvent: vi.fn(),
}));

import {
  getAnonymousUserId,
  getCustomerInfo,
  getOfferings,
  initPurchases,
  presentCustomerCenter,
  purchasePackageByIdentifier,
  restoreAdFreePurchases,
} from './purchases.web';

describe('purchases.web service', () => {
  const mockLocalStorage: Record<string, string> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    for (const key in mockLocalStorage) {
      delete mockLocalStorage[key];
    }

    vi.stubGlobal('window', {
      open: vi.fn(),
    });

    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockLocalStorage[key] || null,
      setItem: (key: string, val: string) => {
        mockLocalStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete mockLocalStorage[key];
      },
    });
  });

  it('generates and stores an anonymous user id on web', () => {
    const id1 = getAnonymousUserId();
    expect(id1).toBeDefined();
    expect(typeof id1).toBe('string');

    const id2 = getAnonymousUserId();
    expect(id1).toBe(id2);
  });

  it('initializes Purchases instance with API key and user ID', async () => {
    const p = await initPurchases();
    expect(p).toBe(mockPurchases);
  });

  it('fetches customer info', async () => {
    const mockInfo = { entitlements: { active: { 'TallyHo Pro': {} } } };
    mockPurchases.getCustomerInfo.mockResolvedValueOnce(mockInfo);

    const info = await getCustomerInfo();
    expect(info).toEqual(mockInfo);
    expect(mockPurchases.getCustomerInfo).toHaveBeenCalled();
  });

  it('fetches and returns mapped offerings', async () => {
    const mockOfferings = {
      current: {
        identifier: 'default',
        availablePackages: [
          {
            identifier: '$rc_lifetime',
            packageType: '$rc_lifetime',
            rcBillingProduct: { currentPrice: { formattedPrice: '$4.99' } },
          },
          {
            identifier: '$rc_annual',
            packageType: '$rc_annual',
            rcBillingProduct: { currentPrice: { formattedPrice: '$2.99' } },
          },
          {
            identifier: '$rc_monthly',
            packageType: '$rc_monthly',
            rcBillingProduct: { currentPrice: { formattedPrice: '$0.99' } },
          },
        ],
      },
    };
    mockPurchases.getOfferings.mockResolvedValueOnce(mockOfferings);

    const offerings = await getOfferings();
    expect(offerings).toBeDefined();
    expect(offerings?.current?.availablePackages.length).toBe(3);
    expect(offerings?.current?.lifetime?.product.priceString).toBe('$4.99');
    expect(offerings?.current?.annual?.product.priceString).toBe('$2.99');
    expect(offerings?.current?.monthly?.product.priceString).toBe('$0.99');
  });

  it('purchases a package successfully when entitlement is active', async () => {
    const mockOfferings = {
      current: {
        identifier: 'default',
        availablePackages: [
          {
            identifier: '$rc_lifetime',
            packageType: '$rc_lifetime',
            rcBillingProduct: { currentPrice: { formattedPrice: '$4.99' } },
          },
        ],
      },
    };
    mockPurchases.getOfferings.mockResolvedValueOnce(mockOfferings);
    mockPurchases.purchase.mockResolvedValueOnce({
      customerInfo: { entitlements: { active: { 'TallyHo Pro': {} } } },
    });

    const result = await purchasePackageByIdentifier('lifetime');
    expect(result.success).toBe(true);
    expect(result.isPro).toBe(true);
  });

  it('links customer email and passes customerEmail to purchase when provided', async () => {
    const mockOfferings = {
      current: {
        identifier: 'default',
        availablePackages: [
          {
            identifier: '$rc_lifetime',
            packageType: '$rc_lifetime',
            rcBillingProduct: { currentPrice: { formattedPrice: '$4.99' } },
          },
        ],
      },
    };
    mockPurchases.getOfferings.mockResolvedValueOnce(mockOfferings);
    mockPurchases.purchase.mockResolvedValueOnce({
      customerInfo: { entitlements: { active: { 'TallyHo Pro': {} } } },
    });

    const result = await purchasePackageByIdentifier('lifetime', 'buyer@example.com');
    expect(mockPurchases.changeUser).toHaveBeenCalledWith('buyer@example.com');
    expect(mockPurchases.setAttributes).toHaveBeenCalledWith({ $email: 'buyer@example.com' });
    expect(mockPurchases.purchase).toHaveBeenCalledWith({
      rcPackage: expect.anything(),
      customerEmail: 'buyer@example.com',
    });
    expect(result.success).toBe(true);
    expect(result.isPro).toBe(true);
  });

  it('handles user cancellation during web checkout gracefully', async () => {
    const mockOfferings = {
      current: {
        identifier: 'default',
        availablePackages: [
          {
            identifier: '$rc_lifetime',
            packageType: '$rc_lifetime',
            rcBillingProduct: { currentPrice: { formattedPrice: '$4.99' } },
          },
        ],
      },
    };
    mockPurchases.getOfferings.mockResolvedValueOnce(mockOfferings);
    mockPurchases.purchase.mockRejectedValueOnce({ userCancelled: true });

    const result = await purchasePackageByIdentifier('lifetime');
    expect(result.success).toBe(false);
    expect(result.userCancelled).toBe(true);
  });

  describe('restoreAdFreePurchases', () => {
    it('restores successfully when local customer info already has entitlement', async () => {
      mockPurchases.getCustomerInfo.mockResolvedValueOnce({
        entitlements: { active: { 'TallyHo Pro': {} } },
      });

      const result = await restoreAdFreePurchases();
      expect(result.success).toBe(true);
      expect(result.isPro).toBe(true);
    });

    it('returns needsEmail: true when no local entitlement is found and no email is provided', async () => {
      mockPurchases.getCustomerInfo.mockResolvedValueOnce({
        entitlements: { active: {} },
      });

      const result = await restoreAdFreePurchases();
      expect(result.success).toBe(false);
      expect(result.needsEmail).toBe(true);
    });

    it('restores cross-platform entitlement by switching user to email', async () => {
      mockPurchases.changeUser.mockResolvedValueOnce(undefined);
      mockPurchases.setAttributes.mockResolvedValueOnce(undefined);
      mockPurchases.getCustomerInfo.mockResolvedValueOnce({
        entitlements: { active: { 'TallyHo Pro': {} } },
      });

      const result = await restoreAdFreePurchases('buyer@example.com');
      expect(mockPurchases.changeUser).toHaveBeenCalledWith('buyer@example.com');
      expect(mockPurchases.setAttributes).toHaveBeenCalledWith({ $email: 'buyer@example.com' });
      expect(result.success).toBe(true);
      expect(result.isPro).toBe(true);
    });

    it('returns error when specified email has no active subscription', async () => {
      mockPurchases.changeUser.mockResolvedValueOnce(undefined);
      mockPurchases.getCustomerInfo.mockResolvedValueOnce({
        entitlements: { active: {} },
      });

      const result = await restoreAdFreePurchases('unknown@example.com');
      expect(result.success).toBe(false);
      expect(result.isPro).toBe(false);
      expect(result.error).toContain('No active TallyHo Pro subscription found');
    });
  });

  describe('presentCustomerCenter', () => {
    it('opens managementURL in a new window when available', async () => {
      const mockOpen = vi.fn();
      vi.stubGlobal('window', { open: mockOpen });

      mockPurchases.getCustomerInfo.mockResolvedValueOnce({
        managementURL: 'https://billing.stripe.com/p/session/test_123',
      });

      await presentCustomerCenter();
      expect(mockOpen).toHaveBeenCalledWith('https://billing.stripe.com/p/session/test_123', '_blank');
    });
  });
});
