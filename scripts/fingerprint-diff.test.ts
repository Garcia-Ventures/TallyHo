import { describe, expect, it } from 'vitest';
import { decideNativeChanged, mapPlatforms, parseArgs } from './fingerprint-diff.mjs';

describe('fingerprint-diff helpers', () => {
  describe('mapPlatforms', () => {
    it('maps all to android+ios', () => {
      expect(mapPlatforms('all')).toEqual(['android', 'ios']);
    });

    it('maps ios to ios only', () => {
      expect(mapPlatforms('ios')).toEqual(['ios']);
    });

    it('defaults anything else to android', () => {
      expect(mapPlatforms('android')).toEqual(['android']);
      expect(mapPlatforms('unknown')).toEqual(['android']);
    });
  });

  describe('parseArgs', () => {
    it('parses base, platform, and flags', () => {
      const opts = parseArgs([
        'node',
        'fingerprint-diff.mjs',
        '--base',
        'v1.2.0',
        '--platform',
        'all',
        '--json',
        '--github-output',
      ]);
      expect(opts).toMatchObject({
        base: 'v1.2.0',
        platform: 'all',
        json: true,
        githubOutput: true,
        useFingerprint: true,
      });
    });

    it('defaults platform and enables fingerprint', () => {
      const opts = parseArgs(['node', 'fingerprint-diff.mjs']);
      expect(opts).toMatchObject({ base: null, platform: 'android', json: false, useFingerprint: true });
    });

    it('supports --no-fingerprint opt-out', () => {
      const opts = parseArgs(['node', 'fingerprint-diff.mjs', '--no-fingerprint']);
      expect(opts.useFingerprint).toBe(false);
    });
  });

  describe('decideNativeChanged', () => {
    it('returns true when fingerprint differs even if path filter is clean', () => {
      expect(decideNativeChanged({ pathFilterHit: false, fingerprintChanged: true, fingerprintFailed: false })).toBe(
        true,
      );
    });

    it('returns true when path filter hits even if fingerprint matches', () => {
      expect(decideNativeChanged({ pathFilterHit: true, fingerprintChanged: false, fingerprintFailed: false })).toBe(
        true,
      );
    });

    it('returns false when both agree there is no change', () => {
      expect(decideNativeChanged({ pathFilterHit: false, fingerprintChanged: false, fingerprintFailed: false })).toBe(
        false,
      );
    });

    it('falls back to path filter when fingerprint fails', () => {
      expect(decideNativeChanged({ pathFilterHit: true, fingerprintChanged: false, fingerprintFailed: true })).toBe(
        true,
      );
      expect(decideNativeChanged({ pathFilterHit: false, fingerprintChanged: true, fingerprintFailed: true })).toBe(
        false,
      );
    });
  });
});
