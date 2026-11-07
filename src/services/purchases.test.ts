import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  PRO_ENTITLEMENT_ID,
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
import { PRO_ENTITLEMENT_ID as entitlementFromConstants } from './purchases.constants';

const servicesDir = dirname(fileURLToPath(import.meta.url));

describe('PRO_ENTITLEMENT_ID', () => {
  it('matches the RevenueCat dashboard id and is not loaded through the platform module', () => {
    expect(entitlementFromConstants).toBe('TallyHo Pro');
    expect(PRO_ENTITLEMENT_ID).toBe(entitlementFromConstants);

    for (const fileName of ['purchases.web.ts', 'purchases.native.ts']) {
      const source = readFileSync(join(servicesDir, fileName), 'utf8');
      expect(source).toContain("from './purchases.constants'");
      expect(source).not.toMatch(/import\s*\{[^}]*PRO_ENTITLEMENT_ID[^}]*\}\s*from\s*'\.\/purchases'/);
    }
  });
});

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
