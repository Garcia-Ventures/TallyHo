import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactJsxRuntime from 'react/jsx-runtime';

if (typeof Array.prototype.at !== 'function') {
  Array.prototype.at = function <T>(this: T[], n: number): T | undefined {
    const len = this.length;
    const k = n >= 0 ? n : len + n;
    return k < 0 || k >= len ? undefined : this[k];
  };
}

if (typeof String.prototype.at !== 'function') {
  String.prototype.at = function (this: string, n: number): string | undefined {
    const len = this.length;
    const k = n >= 0 ? n : len + n;
    return k < 0 || k >= len ? undefined : this.charAt(k);
  };
}

if (typeof window !== 'undefined') {
  const win = window as unknown as Record<string, unknown>;
  win.require = (mod: string) => {
    if (mod === 'react') {
      return React;
    }
    if (mod === 'react-dom') {
      return ReactDOM;
    }
    if (mod === 'react/jsx-runtime') {
      return ReactJsxRuntime;
    }
    return win[mod] || {};
  };
  (globalThis as unknown as Record<string, unknown>).require = win.require;
}
