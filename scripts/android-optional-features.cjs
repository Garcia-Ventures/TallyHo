/**
 * Play treats these as required hardware unless the manifest says otherwise.
 * Portrait comes from app.json orientation. Wi-Fi comes from NetInfo's ACCESS_WIFI_STATE.
 * Neither is required to install or score a game. An explicit required="false" wins over
 * the feature Android implies from the activity orientation and that permission.
 */
const { withAndroidManifest } = require('@expo/config-plugins');

const OPTIONAL_ANDROID_FEATURES = ['android.hardware.screen.portrait', 'android.hardware.wifi'];

function setOptionalAndroidFeatures(androidManifest) {
  const manifest = androidManifest.manifest;
  const existing = manifest['uses-feature'] ?? [];
  const features = Array.isArray(existing) ? existing : [existing];

  for (const name of OPTIONAL_ANDROID_FEATURES) {
    const match = features.find((feature) => feature.$?.['android:name'] === name);
    if (match) {
      match.$['android:required'] = 'false';
      continue;
    }
    features.push({
      $: {
        'android:name': name,
        'android:required': 'false',
      },
    });
  }

  manifest['uses-feature'] = features;
  return androidManifest;
}

function withOptionalAndroidFeatures(config) {
  return withAndroidManifest(config, (config) => {
    config.modResults = setOptionalAndroidFeatures(config.modResults);
    return config;
  });
}

module.exports = {
  OPTIONAL_ANDROID_FEATURES,
  setOptionalAndroidFeatures,
  withOptionalAndroidFeatures,
};
