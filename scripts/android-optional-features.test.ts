import { describe, expect, it } from 'vitest';

import { setOptionalAndroidFeatures, withOptionalAndroidFeatures } from './android-optional-features.cjs';

describe('optional Android hardware features', () => {
  it('marks portrait and wifi optional when the manifest has no uses-feature entries', () => {
    const manifest = setOptionalAndroidFeatures({ manifest: {} });

    expect(manifest.manifest['uses-feature']).toEqual([
      { $: { 'android:name': 'android.hardware.screen.portrait', 'android:required': 'false' } },
      { $: { 'android:name': 'android.hardware.wifi', 'android:required': 'false' } },
    ]);
  });

  it('turns an existing required feature into an optional one without duplicating it', () => {
    const manifest = setOptionalAndroidFeatures({
      manifest: {
        'uses-feature': {
          $: { 'android:name': 'android.hardware.wifi', 'android:required': 'true' },
        },
      },
    });

    expect(manifest.manifest['uses-feature']).toEqual([
      { $: { 'android:name': 'android.hardware.wifi', 'android:required': 'false' } },
      { $: { 'android:name': 'android.hardware.screen.portrait', 'android:required': 'false' } },
    ]);
  });

  it('registers an Android manifest mod', () => {
    const config = withOptionalAndroidFeatures({ name: 'TallyHo', slug: 'tallyho' });
    expect(typeof config.mods?.android?.manifest).toBe('function');
  });
});
