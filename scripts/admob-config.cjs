/**
 * AdMob ID selection for the Expo config and the app bundle.
 *
 * This file is CommonJS on purpose. Expo compiles app.config.ts to a Node require()
 * and does not compile TypeScript modules that the config imports.
 */

const GOOGLE_TEST_ANDROID_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
const GOOGLE_TEST_IOS_APP_ID = 'ca-app-pub-3940256099942544~1458002511';
const GOOGLE_TEST_BANNER_UNIT_ID = 'ca-app-pub-3940256099942544/9214589741';

function showTestAds(env) {
  return env.EXPO_PUBLIC_SHOW_TEST_ADS !== 'false';
}

function isAndroidAppId(value) {
  return /^ca-app-pub-\d+~\d+$/.test(value);
}

function isBannerUnitId(value) {
  return /^ca-app-pub-\d+\/\d+$/.test(value);
}

function resolveAndroidAppId(env) {
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

function resolveIosAppId(env) {
  const configured = env.EXPO_PUBLIC_ADMOB_IOS_APP_ID?.trim() ?? '';
  if (isAndroidAppId(configured) && configured !== GOOGLE_TEST_IOS_APP_ID) {
    return configured;
  }
  return GOOGLE_TEST_IOS_APP_ID;
}

function resolveAndroidBannerUnitId(env) {
  if (showTestAds(env)) {
    return GOOGLE_TEST_BANNER_UNIT_ID;
  }

  const unit = env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID?.trim() ?? '';
  if (!isBannerUnitId(unit) || unit === GOOGLE_TEST_BANNER_UNIT_ID) {
    return null;
  }
  return unit;
}

module.exports = {
  GOOGLE_TEST_ANDROID_APP_ID,
  GOOGLE_TEST_IOS_APP_ID,
  GOOGLE_TEST_BANNER_UNIT_ID,
  showTestAds,
  resolveAndroidAppId,
  resolveIosAppId,
  resolveAndroidBannerUnitId,
};
