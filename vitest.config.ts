import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/*.d.ts',
        'src/types/**',
        'src/native-types.d.ts',
        'src/vite-env.d.ts',
      ],
      // Floor under the measured suite. Raise it when a change covers more of a file.
      thresholds: {
        statements: 65,
        branches: 52,
        functions: 64,
        lines: 65,
      },
    },
  },
});
