import { react } from '@gv-tech/oxc-config/react';
import { typeAware } from '@gv-tech/oxc-config/type-aware';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [react, typeAware],
  rules: {
    // Automatic JSX runtime (tsconfig jsx: react-jsx) — React need not be in scope.
    'react/react-in-jsx-scope': 'off',
    // React Compiler rules are experimental upstream and don't understand
    // Reanimated shared values (.value writes in effects) or intentional
    // impure render reads (Math.random confetti). The previous
    // typescript-eslint setup never enforced them; keep that bar.
    'react/immutability': 'off',
    'react/purity': 'off',
    // Legitimate external-system sync, not derived state: random ad
    // selection + impression tracking on mount (AdBannerCard), RevenueCat
    // offerings fetch on modal open (RemoveAdsModal).
    'react/set-state-in-effect': 'off',
  },
  overrides: [
    {
      // Required side-effect imports: global CSS, CJS shim, RN type augmentation.
      files: ['app/_layout.tsx', 'src/shim-require.test.ts', 'src/native-types.d.ts'],
      rules: { 'import/no-unassigned-import': 'off' },
    },
  ],
});
