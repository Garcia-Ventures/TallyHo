import type { ConfigContext, ExpoConfig } from 'expo/config';

import packageJson from './package.json';

/**
 * Package.json is the only version release-please edits. Reading it here keeps app.json out of that rewrite, which
 * otherwise expands short arrays such as `scheme` and fails `oxfmt --check`.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'TallyHo',
  slug: config.slug ?? 'tallyho',
  version: packageJson.version,
});
