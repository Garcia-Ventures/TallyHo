/** Google's public demo IDs. Safe to ship only in development and preview builds. */
export const GOOGLE_TEST_ANDROID_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
export const GOOGLE_TEST_IOS_APP_ID = 'ca-app-pub-3940256099942544~1458002511';
export const GOOGLE_TEST_BANNER_UNIT_ID = 'ca-app-pub-3940256099942544/9214589741';

export interface AdMobEnv {
  EXPO_PUBLIC_SHOW_TEST_ADS?: string;
  EXPO_PUBLIC_ADMOB_ANDROID_APP_ID?: string;
  EXPO_PUBLIC_ADMOB_IOS_APP_ID?: string;
  EXPO_PUBLIC_ADMOB_BANNER_ANDROID?: string;
  [key: string]: string | undefined;
}

export function showTestAds(env: AdMobEnv): boolean {
  return env.EXPO_PUBLIC_SHOW_TEST_ADS !== 'false';
}

function isAndroidAppId(value: string): boolean {
  return /^ca-app-pub-\d+~\d+$/.test(value);
}

function isBannerUnitId(value: string): boolean {
  return /^ca-app-pub-\d+\/\d+$/.test(value);
}

/**
 * Native App ID baked into the Android manifest at build time.
 * Test builds always use Google's demo ID. A production build refuses the demo ID.
 */
export function resolveAndroidAppId(env: AdMobEnv): string {
  if (showTestAds(env)) {
    return GOOGLE_TEST_ANDROID_APP_ID;
  }

  const configured = env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID?.trim() ?? '';
  if (!isAndroidAppId(configured) || configured === GOOGLE_TEST_ANDROID_APP_ID) {
    throw new Error(
      'Production Android builds require EXPO_PUBLIC_ADMOB_ANDROID_APP_ID from the AdMob Android app (ca-app-pub-…~…). Refusing to embed Google’s test App ID.',
    );
  }

  return configured;
}

/**
 * The Expo plugin requires an iOS App ID even though TallyHo does not request iOS ads.
 * Google’s sample ID is the placeholder until an Apple Developer account exists.
 */
export function resolveIosAppId(env: AdMobEnv): string {
  const configured = env.EXPO_PUBLIC_ADMOB_IOS_APP_ID?.trim() ?? '';
  if (isAndroidAppId(configured) && configured !== GOOGLE_TEST_IOS_APP_ID) {
    return configured;
  }
  return GOOGLE_TEST_IOS_APP_ID;
}

/**
 * Banner unit used by the Android slot. Null means "show a house ad".
 * Production never falls back to Google's demo unit.
 */
export function resolveAndroidBannerUnitId(env: AdMobEnv): string | null {
  if (showTestAds(env)) {
    return GOOGLE_TEST_BANNER_UNIT_ID;
  }

  const unit = env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID?.trim() ?? '';
  if (!isBannerUnitId(unit) || unit === GOOGLE_TEST_BANNER_UNIT_ID) {
    return null;
  }
  return unit;
}
