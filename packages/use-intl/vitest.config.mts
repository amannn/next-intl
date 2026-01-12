import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      'icu-minify/compiler': fileURLToPath(
        new URL('../icu-minify/src/compiler.tsx', import.meta.url)
      ),
      'icu-minify/format': fileURLToPath(
        new URL('../icu-minify/src/format.tsx', import.meta.url)
      )
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './test/setup.tsx'
  }
});
