import AsyncStorage from '@react-native-async-storage/async-storage';

import { logError } from '../utils/logger';
import { createStorage, STORAGE_KEY_LIST } from './storage-core';
import { createMemoryDriver, type StorageDriver } from './storage-driver';

const memory = createMemoryDriver();
let hydrated = false;
let hydratePromise: Promise<void> | null = null;

function persistingDriver(): StorageDriver {
  return {
    getItem: (key) => memory.getItem(key),
    setItem: (key, value) => {
      memory.setItem(key, value);
      void AsyncStorage.setItem(key, value).catch((error: unknown) => {
        logError('Failed to persist storage key', error);
      });
    },
    removeItem: (key) => {
      memory.removeItem(key);
      void AsyncStorage.removeItem(key).catch((error: unknown) => {
        logError('Failed to remove storage key', error);
      });
    },
  };
}

export const storage = createStorage(persistingDriver(), () => hydrated);

/**
 * Loads the four app keys into memory before stores read them. Writes that landed before hydration are kept and flushed
 * so a fast tap cannot be overwritten by a slower disk read.
 */
export async function hydrateStorage(): Promise<void> {
  if (!hydratePromise) {
    hydratePromise = (async () => {
      try {
        const stored = await AsyncStorage.getMany([...STORAGE_KEY_LIST]);
        for (const key of STORAGE_KEY_LIST) {
          const value = stored[key];
          if (typeof value === 'string' && memory.getItem(key) === null) {
            memory.setItem(key, value);
          }
        }
        await Promise.all(
          STORAGE_KEY_LIST.map(async (key) => {
            const value = memory.getItem(key);
            if (value !== null) {
              await AsyncStorage.setItem(key, value);
            }
          }),
        );
      } catch (error) {
        logError('Failed to hydrate storage', error);
      } finally {
        hydrated = true;
      }
    })();
  }
  await hydratePromise;
}
