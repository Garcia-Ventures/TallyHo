import {
  GOOGLE_TEST_ANDROID_APP_ID as testAndroidAppId,
  GOOGLE_TEST_BANNER_UNIT_ID as testBannerUnitId,
  GOOGLE_TEST_IOS_APP_ID as testIosAppId,
  resolveAndroidAppId as resolveAndroidAppIdFromConfig,
  resolveAndroidBannerUnitId as resolveAndroidBannerUnitIdFromConfig,
  resolveIosAppId as resolveIosAppIdFromConfig,
  showTestAds as showTestAdsFromConfig,
} from '../../scripts/admob-config.cjs';

/** Google's public demo IDs. Safe to ship only in development and preview builds. */
export const GOOGLE_TEST_ANDROID_APP_ID: string = testAndroidAppId;
export const GOOGLE_TEST_IOS_APP_ID: string = testIosAppId;
export const GOOGLE_TEST_BANNER_UNIT_ID: string = testBannerUnitId;

export interface AdMobEnv {
  EXPO_PUBLIC_SHOW_TEST_ADS?: string;
  EXPO_PUBLIC_ADMOB_ANDROID_APP_ID?: string;
  EXPO_PUBLIC_ADMOB_IOS_APP_ID?: string;
  EXPO_PUBLIC_ADMOB_BANNER_ANDROID?: string;
  [key: string]: string | undefined;
}

export function showTestAds(env: AdMobEnv): boolean {
  return showTestAdsFromConfig(env);
}

/**
 * Native App ID baked into the Android manifest at build time.
 * Test builds always use Google's demo ID. A production build refuses the demo ID.
 */
export function resolveAndroidAppId(env: AdMobEnv): string {
  return resolveAndroidAppIdFromConfig(env);
}

/**
 * The Expo plugin requires an iOS App ID even though TallyHo does not request iOS ads.
 * Google's sample ID is the placeholder until an Apple Developer account exists.
 */
export function resolveIosAppId(env: AdMobEnv): string {
  return resolveIosAppIdFromConfig(env);
}

/**
 * Banner unit used by the Android slot. Null means "show a house ad".
 * Production never falls back to Google's demo unit.
 */
export function resolveAndroidBannerUnitId(env: AdMobEnv): string | null {
  return resolveAndroidBannerUnitIdFromConfig(env);
}
