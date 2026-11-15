import {fileURLToPath} from 'url';
import {defineConfig} from 'vite-plus';

export default defineConfig({
  test: {
    // Run against the source so module mocks (e.g. `fs/promises`) also apply
    // to the catalog code that lives in `@eloqnt/messages`.
    alias: {
      '@eloqnt/messages/_internal': fileURLToPath(
        new URL('../messages/src/_internal.ts', import.meta.url)
      )
    }
  }
});
