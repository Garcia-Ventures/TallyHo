/** Synchronous key/value driver used by the storage service. */
export interface StorageDriver {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function createMemoryDriver(): StorageDriver {
  const memory: Record<string, string> = {};
  return {
    getItem: (key) => (Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : null),
    setItem: (key, value) => {
      memory[key] = value;
    },
    removeItem: (key) => {
      delete memory[key];
    },
  };
}

function localStore(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

/** Web driver. Reads `localStorage` on each call so tests can stub it. Falls back to memory when it is missing. */
export function createWebDriver(): StorageDriver {
  const memory = createMemoryDriver();

  return {
    getItem: (key) => {
      const store = localStore();
      return store ? store.getItem(key) : memory.getItem(key);
    },
    setItem: (key, value) => {
      const store = localStore();
      if (store) {
        store.setItem(key, value);
      } else {
        memory.setItem(key, value);
      }
    },
    removeItem: (key) => {
      const store = localStore();
      if (store) {
        store.removeItem(key);
      } else {
        memory.removeItem(key);
      }
    },
  };
}
