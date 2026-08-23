import { describe, expect, it } from 'vitest';
import { generateFallbackSummary, isQuotaLimitError } from './eas-build-safe.mjs';

describe('eas-build-safe utility', () => {
  describe('isQuotaLimitError', () => {
    it('detects free plan limit exceeded messages', () => {
      const output = 'Error: Free plan limit exceeded. You have 0 free builds remaining this month.';
      expect(isQuotaLimitError(output)).toBe(true);
    });

    it('detects concurrency limit reached messages', () => {
      const output =
        'Error: You have exceeded your plan concurrency limit. Upgrade your plan to run more concurrent builds.';
      expect(isQuotaLimitError(output)).toBe(true);
    });

    it('detects payment required and build credits exhaustion', () => {
      const output = 'Payment required: No remaining build credits on account.';
      expect(isQuotaLimitError(output)).toBe(true);
    });

    it('detects resource limit reached messages', () => {
      const output = 'Resource limit reached for organization GVTech. Please upgrade your EAS plan.';
      expect(isQuotaLimitError(output)).toBe(true);
    });

    it('returns false for actual code compilation or bundle errors', () => {
      const compileError = 'error: package com.swmansion.gesturehandler does not exist';
      expect(isQuotaLimitError(compileError)).toBe(false);

      const typeError = 'TypeScript compiler exited with error TS2322 in src/App.tsx';
      expect(isQuotaLimitError(typeError)).toBe(false);

      const secretError = 'Google Play service account key was not found in working directory';
      expect(isQuotaLimitError(secretError)).toBe(false);
    });

    it('handles empty or null output gracefully', () => {
      expect(isQuotaLimitError('')).toBe(false);
      expect(isQuotaLimitError(null as unknown as string)).toBe(false);
    });
  });

  describe('generateFallbackSummary', () => {
    it('generates summary for Android platform with local submit instructions', () => {
      const summary = generateFallbackSummary('android', 'Error: Free plan limit exceeded');
      expect(summary).toContain('⚠️ Expo EAS Cloud Build Usage Limit Exceeded');
      expect(summary).toContain('bun run build:android:local:submit');
      expect(summary).toContain('git pull origin main');
    });

    it('generates summary for iOS platform with local build instructions', () => {
      const summary = generateFallbackSummary('ios', 'Error: Concurrency limit reached');
      expect(summary).toContain('eas build --platform ios --profile production --local');
    });
  });
});
