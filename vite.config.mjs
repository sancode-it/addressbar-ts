/// <reference types="vitest" />
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'addressbar',
      formats: ['umd'],
      fileName: 'addressbar',
    },
    minify: true,
    sourcemap: true,
  },
  test: {
    testFiles: ['src/tests/**/*.test.ts'],
    testTimeout: 20000,
    hookTimeout: 40000,
  },
})
