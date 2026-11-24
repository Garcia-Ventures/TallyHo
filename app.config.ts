import type { ConfigContext, ExpoConfig } from 'expo/config';

import packageJson from './package.json';
import { resolveAndroidAppId, resolveIosAppId } from './scripts/admob-config.cjs';
import { withOptionalAndroidFeatures } from './scripts/android-optional-features.cjs';

/**
 * Package.json is the only version release-please edits. Reading it here keeps app.json out of that rewrite, which
 * otherwise expands short arrays such as `scheme` and fails `oxfmt --check`.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const blockedPermissions = [
    ...new Set([...(config.android?.blockedPermissions ?? []), 'com.google.android.gms.permission.AD_ID']),
  ];

  return {
    ...config,
    name: config.name ?? 'TallyHo',
    slug: config.slug ?? 'tallyho',
    version: packageJson.version,
    android: {
      ...config.android,
      blockedPermissions,
    },
    plugins: [
      ...(config.plugins ?? []),
      [
        'react-native-google-mobile-ads',
        {
          androidAppId: resolveAndroidAppId(process.env),
          // Sample iOS ID until an Apple Developer account exists. See docs/how-to/admob.md.
          iosAppId: resolveIosAppId(process.env),
          delayAppMeasurementInit: true,
        },
      ],
      [
        'expo-build-properties',
        {
          android: {
            extraProguardRules: '-keep class com.google.android.gms.internal.consent_sdk.** { *; }',
          },
        },
      ],
      withOptionalAndroidFeatures,
    ],
  };
};
