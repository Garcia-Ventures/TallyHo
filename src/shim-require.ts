import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactJsxRuntime from 'react/jsx-runtime';

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
