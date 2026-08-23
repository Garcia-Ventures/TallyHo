import { describe, expect, it } from 'vitest';
import {
  getCustomerInfo,
  getOfferings,
  initPurchases,
  presentCustomerCenter,
  presentPaywall,
  purchaseAdFreePackage,
  purchasePackage,
  purchasePackageByIdentifier,
  restoreAdFreePurchases,
} from './purchases';

describe('purchases base service fallbacks', () => {
  it('handles base fallback functions in test / default environments', async () => {
    await expect(initPurchases()).resolves.toBeUndefined();
    await expect(getCustomerInfo()).resolves.toBeNull();
    await expect(getOfferings()).resolves.toBeNull();

    const pResult = await purchasePackage();
    expect(pResult.success).toBe(true);
    expect(pResult.isPro).toBe(true);

    const tierResult = await purchasePackageByIdentifier('lifetime');
    expect(tierResult.success).toBe(true);

    const adFreeResult = await purchaseAdFreePackage();
    expect(adFreeResult.success).toBe(true);

    const restoreResult = await restoreAdFreePurchases('user@example.com');
    expect(restoreResult.success).toBe(true);

    const paywallResult = await presentPaywall();
    expect(paywallResult.success).toBe(true);

    const centerResult = await presentCustomerCenter();
    expect(centerResult).toBe(true);
  });
});
