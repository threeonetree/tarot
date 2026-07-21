import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true,
    exclude: [
      'node_modules/**',
      'tarot-guide-v1.0.0-package/**',
      'dist/**',
      'src/__tests__/rendered-html.test.mjs',
    ],
  },
});
