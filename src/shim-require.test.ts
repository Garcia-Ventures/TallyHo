import { describe, expect, it } from 'vitest';
import './shim-require';

describe('shim-require polyfills', () => {
  it('polyfilled Array.prototype.at handles positive and negative indices', () => {
    const list = ['first', 'middle', 'last'];
    expect(list.at(0)).toBe('first');
    expect(list.at(1)).toBe('middle');
    expect(list.at(-1)).toBe('last');
    expect(list.at(-2)).toBe('middle');
    expect(list.at(5)).toBeUndefined();
    expect(list.at(-10)).toBeUndefined();
  });

  it('polyfilled String.prototype.at handles positive and negative indices', () => {
    const text = 'TallyHo';
    expect(text.at(0)).toBe('T');
    expect(text.at(-1)).toBe('o');
    expect(text.at(1)).toBe('a');
    expect(text.at(10)).toBeUndefined();
    expect(text.at(-20)).toBeUndefined();
  });
});
