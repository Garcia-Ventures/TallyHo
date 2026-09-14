import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import type { AdContent } from './config';

describe('AD_CONFIG', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('sets showTestAds to true when EXPO_PUBLIC_SHOW_TEST_ADS is not false', async () => {
    vi.stubEnv('EXPO_PUBLIC_SHOW_TEST_ADS', 'true');
    const { AD_CONFIG } = await import('./config');
    expect(AD_CONFIG.showTestAds).toBe(true);
  });

  it('sets showTestAds to false when EXPO_PUBLIC_SHOW_TEST_ADS is "false"', async () => {
    vi.stubEnv('EXPO_PUBLIC_SHOW_TEST_ADS', 'false');
    const { AD_CONFIG } = await import('./config');
    expect(AD_CONFIG.showTestAds).toBe(false);
  });

  it('sets showTestAds to true when EXPO_PUBLIC_SHOW_TEST_ADS is undefined', async () => {
    vi.stubEnv('EXPO_PUBLIC_SHOW_TEST_ADS', '');
    delete process.env.EXPO_PUBLIC_SHOW_TEST_ADS; // Make sure it's fully missing just in case
    const { AD_CONFIG } = await import('./config');
    expect(AD_CONFIG.showTestAds).toBe(true);
  });

  it('contains the expected static properties', async () => {
    const { AD_CONFIG } = await import('./config');

    // Product info
    expect(AD_CONFIG.productId).toBe('tallyho_ad_free_lifetime');
    expect(AD_CONFIG.entitlementId).toBe('TallyHo Pro');

    // House Ads
    expect(Array.isArray(AD_CONFIG.houseAds)).toBe(true);
    expect(AD_CONFIG.houseAds.length).toBe(2);

    const houseAdPro = AD_CONFIG.houseAds.find((ad: AdContent) => ad.id === 'house_ad_pro');
    expect(houseAdPro).toBeDefined();
    expect(houseAdPro?.title).toContain('Ad-Free');

    const houseAdGventures = AD_CONFIG.houseAds.find((ad: AdContent) => ad.id === 'house_ad_gventures');
    expect(houseAdGventures).toBeDefined();
    expect(houseAdGventures?.linkUrl).toBe('https://gventureshq.com');

    // Ad Blocker Fallback Ad
    expect(AD_CONFIG.adBlockerFallbackAd).toBeDefined();
    expect(AD_CONFIG.adBlockerFallbackAd.id).toBe('ad_blocker_fallback');
    expect(AD_CONFIG.adBlockerFallbackAd.badge).toBe('SUPPORT TALLYHO');
  });
});
