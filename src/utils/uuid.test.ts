import { describe, expect, it } from 'vitest';

import { generateId, generateUUID } from './uuid';

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('uuid utility', () => {
  it('generates a valid RFC4122 v4 UUID using default environment', () => {
    const id = generateUUID();
    expect(id).toMatch(UUID_V4_REGEX);
  });

  it('generates a valid UUID when crypto is undefined (React Native Hermes simulation)', () => {
    const originalCrypto = globalThis.crypto;
    try {
      // @ts-expect-error - simulating React Native environment where crypto is missing
      delete globalThis.crypto;

      const id = generateUUID();
      expect(id).toMatch(UUID_V4_REGEX);

      const prefixed = generateId('p');
      expect(prefixed.startsWith('p_')).toBe(true);
      expect(prefixed.slice(2)).toMatch(UUID_V4_REGEX);
    } finally {
      globalThis.crypto = originalCrypto;
    }
  });

  it('generates unique IDs across successive calls', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 50; i++) {
      ids.add(generateId('test'));
    }
    expect(ids.size).toBe(50);
  });

  it('handles generateId with and without prefix', () => {
    const idNoPrefix = generateId();
    expect(idNoPrefix).toMatch(UUID_V4_REGEX);

    const idWithPrefix = generateId('player');
    expect(idWithPrefix.startsWith('player_')).toBe(true);
  });
});
