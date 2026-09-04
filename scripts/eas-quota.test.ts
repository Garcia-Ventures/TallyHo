import { describe, expect, it } from 'vitest';
import { formatBadge, monthStartUTC, parseArgs, requestOk, statusFor, summarizeBuilds } from './eas-quota.mjs';

const NOW = new Date('2026-09-04T12:00:00Z');

function build(overrides = {}) {
  return { id: 'x', status: 'FINISHED', platform: 'ANDROID', createdAt: '2026-09-01T10:00:00Z', ...overrides };
}

describe('eas-quota helpers', () => {
  describe('parseArgs', () => {
    it('defaults to all platforms, android request, free budgets', () => {
      expect(parseArgs(['node', 'eas-quota.mjs'])).toMatchObject({
        platform: 'all',
        request: 'android',
        budgetAndroid: 15,
        budgetIos: 15,
        warnAt: 5,
        failOnExhausted: false,
      });
    });

    it('parses budgets, request, and flags', () => {
      const opts = parseArgs([
        'node',
        'eas-quota.mjs',
        '--request',
        'all',
        '--budget-android',
        '30',
        '--warn-at',
        '3',
        '--fail-on-exhausted',
        '--json',
      ]);
      expect(opts).toMatchObject({ request: 'all', budgetAndroid: 30, warnAt: 3, failOnExhausted: true, json: true });
    });

    it('falls back to android on empty request', () => {
      expect(parseArgs(['node', 'eas-quota.mjs', '--request', '']).request).toBe('android');
    });
  });

  describe('monthStartUTC', () => {
    it('returns the 1st of the current UTC month', () => {
      expect(monthStartUTC(NOW).toISOString()).toBe('2026-09-01T00:00:00.000Z');
    });
  });

  describe('statusFor', () => {
    it('maps remaining counts to ok/warning/exhausted', () => {
      expect(statusFor(15, 5)).toBe('ok');
      expect(statusFor(6, 5)).toBe('ok');
      expect(statusFor(5, 5)).toBe('warning');
      expect(statusFor(1, 5)).toBe('warning');
      expect(statusFor(0, 5)).toBe('exhausted');
    });
  });

  describe('summarizeBuilds', () => {
    it('counts this-month builds per platform', () => {
      const summary = summarizeBuilds([build(), build(), build({ platform: 'IOS' })], { now: NOW });
      expect(summary.used).toEqual({ android: 2, ios: 1 });
      expect(summary.remaining).toEqual({ android: 13, ios: 14 });
      expect(summary.overall).toBe('ok');
    });

    it('ignores builds from prior months and canceled builds', () => {
      const summary = summarizeBuilds(
        [
          build({ createdAt: '2026-08-31T23:59:59Z' }),
          build({ status: 'CANCELED' }),
          build({ status: 'canceled' }),
          build(),
        ],
        { now: NOW },
      );
      expect(summary.used).toEqual({ android: 1, ios: 0 });
      expect(summary.counted).toBe(1);
    });

    it('counts in-progress and errored builds against quota', () => {
      const summary = summarizeBuilds(
        [build({ status: 'IN_PROGRESS' }), build({ status: 'ERRORED' }), build({ status: 'IN_QUEUE' })],
        { now: NOW },
      );
      expect(summary.used.android).toBe(3);
    });

    it('reports warning and exhausted overall status', () => {
      const nine = Array.from({ length: 9 }, () => build());
      expect(summarizeBuilds(nine, { now: NOW }).overall).toBe('ok');
      expect(summarizeBuilds([...nine, build()], { now: NOW }).overall).toBe('warning');
      expect(
        summarizeBuilds(
          Array.from({ length: 15 }, () => build()),
          { now: NOW },
        ).overall,
      ).toBe('exhausted');
    });

    it('skips entries with unknown platform or bad dates', () => {
      const summary = summarizeBuilds([build({ platform: 'WEB' }), build({ createdAt: 'not-a-date' }), null], {
        now: NOW,
      });
      expect(summary.used).toEqual({ android: 0, ios: 0 });
    });
  });

  describe('requestOk', () => {
    it('checks only requested platforms', () => {
      const summary = summarizeBuilds(
        Array.from({ length: 15 }, () => build()),
        { now: NOW },
      );
      expect(requestOk(summary, 'android')).toBe(false);
      expect(requestOk(summary, 'ios')).toBe(true);
      expect(requestOk(summary, 'all')).toBe(false);
    });
  });

  describe('formatBadge', () => {
    it('renders usage lines and month', () => {
      const badge = formatBadge(summarizeBuilds([build()], { now: NOW }));
      expect(badge).toContain('September 2026');
      expect(badge).toContain('**1/15**');
      expect(badge).toContain('14 left');
    });
  });
});
