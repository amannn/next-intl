import {defineConfig} from 'vitest/config';
import {fileURLToPath} from 'url';

export default defineConfig({
  resolve: {
    alias: {
      // Workspace packages like icu-minify are typically only consumable after build.
      // In tests, alias to a local module so it can be mocked.
      'icu-minify/compiler': fileURLToPath(
        new URL('./test/mocks/icu-minify-compiler.ts', import.meta.url)
      )
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './test/setup.tsx'
  }
});
