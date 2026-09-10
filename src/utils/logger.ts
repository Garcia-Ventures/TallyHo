import { captureException } from './sentry';

function isDev(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

/** Error-level log: dev console output + Sentry capture in all environments. */
export function logError(message: string, error?: unknown): void {
  if (isDev()) {
    // eslint-disable-next-line no-console
    console.error(message, error);
  }
  captureException(error ?? new Error(message), { message });
}

/** Warning-level log: dev console output + Sentry capture in all environments. */
export function logWarn(message: string, error?: unknown): void {
  if (isDev()) {
    // eslint-disable-next-line no-console
    console.warn(message, error);
  }
  captureException(error ?? new Error(message), { message, level: 'warning' });
}

/** Info-level log: dev console output only, never sent to Sentry. */
export function logInfo(message: string, ...args: unknown[]): void {
  if (isDev()) {
    // eslint-disable-next-line no-console
    console.log(message, ...args);
  }
}
