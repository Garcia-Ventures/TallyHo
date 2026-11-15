import { describe, expect, it } from 'vitest';

import { applyKeypadDigit } from './scoreKeypad';

describe('applyKeypadDigit', () => {
  it('appends digits until the length cap', () => {
    expect(applyKeypadDigit('12', '3')).toBe('123');
    expect(applyKeypadDigit('12345', '6')).toBe('12345');
  });

  it('deletes and clears', () => {
    expect(applyKeypadDigit('12', 'DEL')).toBe('1');
    expect(applyKeypadDigit('12', 'CLR')).toBe('');
  });
});
