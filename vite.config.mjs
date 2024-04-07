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
    minify: false,
    sourcemap: true,
  },
})
