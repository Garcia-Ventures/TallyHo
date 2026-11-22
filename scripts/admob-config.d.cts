export interface AdMobConfigEnv {
  EXPO_PUBLIC_SHOW_TEST_ADS?: string;
  EXPO_PUBLIC_ADMOB_ANDROID_APP_ID?: string;
  EXPO_PUBLIC_ADMOB_IOS_APP_ID?: string;
  EXPO_PUBLIC_ADMOB_BANNER_ANDROID?: string;
  [key: string]: string | undefined;
}

export const GOOGLE_TEST_ANDROID_APP_ID: string;
export const GOOGLE_TEST_IOS_APP_ID: string;
export const GOOGLE_TEST_BANNER_UNIT_ID: string;

export function showTestAds(env: AdMobConfigEnv): boolean;
export function resolveAndroidAppId(env: AdMobConfigEnv): string;
export function resolveIosAppId(env: AdMobConfigEnv): string;
export function resolveAndroidBannerUnitId(env: AdMobConfigEnv): string | null;
