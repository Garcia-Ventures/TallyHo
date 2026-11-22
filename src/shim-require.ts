import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactJsxRuntime from 'react/jsx-runtime';

if (typeof Array.prototype.at !== 'function') {
  // eslint-disable-next-line no-extend-native
  Array.prototype.at = function <T>(this: T[], n: number): T | undefined {
    const len = this.length;
    const k = n >= 0 ? n : len + n;
    return k < 0 || k >= len ? undefined : this[k];
  };
}

if (typeof String.prototype.at !== 'function') {
  // eslint-disable-next-line no-extend-native
  String.prototype.at = function (this: string, n: number): string | undefined {
    const len = this.length;
    const k = n >= 0 ? n : len + n;
    return k < 0 || k >= len ? undefined : this.charAt(k);
  };
}

function requireModule(mod: string): unknown {
  if (mod === 'react') {
    return React;
  }
  if (mod === 'react-dom') {
    return ReactDOM;
  }
  if (mod === 'react/jsx-runtime') {
    return ReactJsxRuntime;
  }
  if (typeof window === 'undefined') {
    return {};
  }
  const value: unknown = Reflect.get(window, mod);
  return value || {};
}

if (typeof window !== 'undefined') {
  Object.assign(window, { require: requireModule });
  Object.assign(globalThis, { require: requireModule });
}
