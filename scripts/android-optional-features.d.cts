import type { ExpoConfig } from 'expo/config';

export const OPTIONAL_ANDROID_FEATURES: readonly string[];

export function withOptionalAndroidFeatures(config: ExpoConfig): ExpoConfig;
