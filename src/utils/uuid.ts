/**
 * Generates an RFC4122 v4-style unique ID safely across JavaScript runtimes (React Native Hermes/JSC, Web, Node/SSR).
 *
 * Avoids a bare `crypto` identifier, which throws ReferenceError in React Native. Prefers Web Crypto. Hermes on Android
 * often has no global `crypto` (TALLYHO-S); local ids then fall back to Math.random so player setup does not crash.
 * These ids are local identifiers, not secrets.
 */
function secureBytes(length: number): Uint8Array | null {
  try {
    const cryptoObj = globalThis.crypto;
    if (!cryptoObj?.getRandomValues) {
      return null;
    }
    const bytes = new Uint8Array(length);
    cryptoObj.getRandomValues(bytes);
    return bytes;
  } catch {
    return null;
  }
}

export function generateUUID(): string {
  try {
    if (typeof globalThis.crypto?.randomUUID === 'function') {
      return globalThis.crypto.randomUUID();
    }
  } catch {
    // randomUUID can exist and still reject on some embedded engines.
  }

  const bytes = secureBytes(16);
  let index = 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const source = bytes ? (bytes[index++] ?? 0) : Math.floor(Math.random() * 256);
    const r = source & 15;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Generates a prefixed unique ID, e.g. `generateId('p')` -> `p_xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx` */
export function generateId(prefix?: string): string {
  const uuid = generateUUID();
  return prefix ? `${prefix}_${uuid}` : uuid;
}
