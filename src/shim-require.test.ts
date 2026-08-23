import { describe, expect, it } from 'vitest';
import './shim-require';

describe('shim-require module', () => {
  it('polyfils Array.prototype.at and String.prototype.at if needed', () => {
    const arr = [10, 20, 30];
    expect(arr.at(-1)).toBe(30);
    expect(arr.at(0)).toBe(10);
    expect(arr.at(99)).toBeUndefined();

    const str = 'tallyho';
    expect(str.at(-1)).toBe('o');
    expect(str.at(0)).toBe('t');
    expect(str.at(99)).toBeUndefined();
  });
});
