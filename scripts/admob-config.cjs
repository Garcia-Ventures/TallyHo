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

/**
 * EAS CLI evaluates app.config once to discover the project id, with only the eas.json env block.
 * That pass sets EXPO_PUBLIC_SHOW_TEST_ADS=false and has not downloaded the production App ID yet.
 * A later pass includes the other production variables. Those markers mean the real env is loaded.
 */
const EAS_ENV_MARKERS = ['EXPO_PUBLIC_OPENPANEL_CLIENT_ID', 'EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID'];

function easEnvironmentLoaded(env) {
  return EAS_ENV_MARKERS.some((key) => Boolean(env[key]?.trim()));
}

function resolveAndroidAppId(env) {
  if (showTestAds(env)) {
    return GOOGLE_TEST_ANDROID_APP_ID;
  }

  const configured = env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID?.trim() ?? '';
  if (isAndroidAppId(configured) && configured !== GOOGLE_TEST_ANDROID_APP_ID) {
    return configured;
  }

  if (!easEnvironmentLoaded(env)) {
    return GOOGLE_TEST_ANDROID_APP_ID;
  }

  throw new Error(
    'Production Android builds require EXPO_PUBLIC_ADMOB_ANDROID_APP_ID from the AdMob Android app (ca-app-pub-…~…). Refusing to embed Google’s test App ID.',
  );
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
