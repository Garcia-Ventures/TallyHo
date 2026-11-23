import { describe, expect, it } from 'vitest';

import {
  GOOGLE_TEST_ANDROID_APP_ID,
  GOOGLE_TEST_BANNER_UNIT_ID,
  GOOGLE_TEST_IOS_APP_ID,
  resolveAndroidAppId,
  resolveAndroidBannerUnitId,
  resolveIosAppId,
} from './admob';

const REAL_APP_ID = 'ca-app-pub-2441210659621996~1234567890';
const REAL_IOS_APP_ID = 'ca-app-pub-2441210659621996~9876543210';
const REAL_UNIT_ID = 'ca-app-pub-2441210659621996/1234567890';

describe('AdMob ID resolution', () => {
  it('uses Google demo IDs when test ads are on', () => {
    const env = { EXPO_PUBLIC_SHOW_TEST_ADS: 'true' };
    expect(resolveAndroidAppId(env)).toBe(GOOGLE_TEST_ANDROID_APP_ID);
    expect(resolveAndroidBannerUnitId(env)).toBe(GOOGLE_TEST_BANNER_UNIT_ID);
  });

  it('treats a missing test flag as test mode', () => {
    expect(resolveAndroidBannerUnitId({})).toBe(GOOGLE_TEST_BANNER_UNIT_ID);
  });

  it('uses the real Android App ID and banner unit in production', () => {
    const env = {
      EXPO_PUBLIC_SHOW_TEST_ADS: 'false',
      EXPO_PUBLIC_ADMOB_ANDROID_APP_ID: REAL_APP_ID,
      EXPO_PUBLIC_ADMOB_BANNER_ANDROID: REAL_UNIT_ID,
    };
    expect(resolveAndroidAppId(env)).toBe(REAL_APP_ID);
    expect(resolveAndroidBannerUnitId(env)).toBe(REAL_UNIT_ID);
  });

  it('allows the EAS project-id read before production env vars are downloaded', () => {
    expect(resolveAndroidAppId({ EXPO_PUBLIC_SHOW_TEST_ADS: 'false' })).toBe(GOOGLE_TEST_ANDROID_APP_ID);
  });

  it('refuses a production Android build that still has the demo App ID', () => {
    expect(() =>
      resolveAndroidAppId({
        EXPO_PUBLIC_SHOW_TEST_ADS: 'false',
        EXPO_PUBLIC_OPENPANEL_CLIENT_ID: 'client',
        EXPO_PUBLIC_ADMOB_ANDROID_APP_ID: GOOGLE_TEST_ANDROID_APP_ID,
      }),
    ).toThrow(/EXPO_PUBLIC_ADMOB_ANDROID_APP_ID/);
  });

  it('refuses a loaded production environment that is missing the App ID', () => {
    expect(() =>
      resolveAndroidAppId({
        EXPO_PUBLIC_SHOW_TEST_ADS: 'false',
        EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID: 'goog_test',
      }),
    ).toThrow(/EXPO_PUBLIC_ADMOB_ANDROID_APP_ID/);
  });

  it('returns null for a missing production banner unit so the house card can show', () => {
    expect(resolveAndroidBannerUnitId({ EXPO_PUBLIC_SHOW_TEST_ADS: 'false' })).toBeNull();
    expect(
      resolveAndroidBannerUnitId({
        EXPO_PUBLIC_SHOW_TEST_ADS: 'false',
        EXPO_PUBLIC_ADMOB_BANNER_ANDROID: GOOGLE_TEST_BANNER_UNIT_ID,
      }),
    ).toBeNull();
  });

  it('keeps the sample iOS App ID until a real one is provided', () => {
    expect(resolveIosAppId({ EXPO_PUBLIC_SHOW_TEST_ADS: 'false' })).toBe(GOOGLE_TEST_IOS_APP_ID);
    expect(resolveIosAppId({ EXPO_PUBLIC_ADMOB_IOS_APP_ID: REAL_IOS_APP_ID })).toBe(REAL_IOS_APP_ID);
    expect(resolveIosAppId({ EXPO_PUBLIC_ADMOB_IOS_APP_ID: GOOGLE_TEST_IOS_APP_ID })).toBe(GOOGLE_TEST_IOS_APP_ID);
  });
});
