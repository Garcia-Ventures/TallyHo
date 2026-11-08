import { beforeEach, describe, expect, it } from 'vitest';

import { nextHouseAd, resetHouseAdRotation } from './houseAdRotation';

const ads = ['pro', 'parable', 'hq', 'travel'] as const;

describe('nextHouseAd', () => {
  beforeEach(() => {
    resetHouseAdRotation();
  });

  it('starts at the random index, then walks forward and wraps', () => {
    expect(nextHouseAd(ads, () => 1)).toBe('parable');
    expect(nextHouseAd(ads, () => 0)).toBe('hq');
    expect(nextHouseAd(ads, () => 99)).toBe('travel');
    expect(nextHouseAd(ads, () => 0)).toBe('pro');
  });

  it('normalizes a negative random index', () => {
    expect(nextHouseAd(ads, () => -1)).toBe('travel');
  });

  it('rejects an empty catalog', () => {
    expect(() => nextHouseAd([], () => 0)).toThrow(/at least one ad/);
  });
});
