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

    // Fail-closed: the base stub must never grant Pro (TALLYHO-P follow-up).
    const pResult = await purchasePackage();
    expect(pResult.success).toBe(false);
    expect(pResult.isPro).toBe(false);

    const tierResult = await purchasePackageByIdentifier('lifetime');
    expect(tierResult.success).toBe(false);
    expect(tierResult.isPro).toBe(false);

    const adFreeResult = await purchaseAdFreePackage();
    expect(adFreeResult.success).toBe(false);

    const restoreResult = await restoreAdFreePurchases('user@example.com');
    expect(restoreResult.success).toBe(false);

    const paywallResult = await presentPaywall();
    expect(paywallResult.success).toBe(false);

    const centerResult = await presentCustomerCenter();
    expect(centerResult).toBe(false);
  });
});
