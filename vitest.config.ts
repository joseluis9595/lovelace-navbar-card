import { defineConfig } from 'vitest/config';
import * as path from 'node:path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@errors': path.resolve(__dirname, 'src/errors'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },
});
