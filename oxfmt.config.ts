import { oxfmtConfig } from '@gv-tech/oxc-config/oxfmt';
import { defineConfig } from 'oxfmt';

// Shared config already ignores CHANGELOG.md (release-please owns that file)
// plus generated and foreign paths. Replacing `ignorePatterns` would drop those.
export default defineConfig({
  ...oxfmtConfig,
});
