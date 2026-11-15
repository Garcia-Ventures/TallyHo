import { createStorage } from './storage-core';
import { createWebDriver } from './storage-driver';

export const storage = createStorage(createWebDriver());

/** Web storage is synchronous. Native overrides this and loads AsyncStorage first. */
export async function hydrateStorage(): Promise<void> {}
