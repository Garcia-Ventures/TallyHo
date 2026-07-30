import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const selectorCjs = path.resolve(
  __dirname,
  './node_modules/use-sync-external-store/cjs/use-sync-external-store-with-selector.development.js',
);

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: [
      ...(command === 'serve'
        ? [
            { find: 'use-sync-external-store/with-selector.js', replacement: selectorCjs },
            { find: 'use-sync-external-store/with-selector', replacement: selectorCjs },
            { find: 'use-sync-external-store/shim/with-selector.js', replacement: selectorCjs },
            { find: 'use-sync-external-store/shim/with-selector', replacement: selectorCjs },
          ]
        : []),
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-is',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'use-sync-external-store',
      'eventemitter3',
      'canvas-confetti',
      'next-themes',
      'clsx',
      'tailwind-merge',
      'class-variance-authority',
      'lucide-react',
    ],
    exclude: ['@gv-tech/ui-web', '@gv-tech/design-tokens'],
  },
  server: {
    port: 3000,
    open: true,
  },
}));
