/**
 * Generates an RFC4122 v4-compliant UUID safely across all JavaScript runtimes (React Native Hermes/JSC, Web,
 * Node/SSR).
 *
 * Avoids direct reference to `crypto` identifier which throws ReferenceError in React Native.
 */
export function generateUUID(): string {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  // RFC4122 v4 compliant fallback using secure random numbers
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const randomValue = globalThis.crypto.getRandomValues(new Uint8Array(1))[0];
      const r = (randomValue ?? 0) & 15;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  throw new Error('Secure random number generation is not supported in this environment.');
}

/** Generates a prefixed unique ID, e.g. `generateId('p')` -> `p_xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` */
export function generateId(prefix?: string): string {
  const uuid = generateUUID();
  return prefix ? `${prefix}_${uuid}` : uuid;
}
