import {fileURLToPath} from 'url';
import {defineConfig} from 'vitest/config';

function resolveSource(relativePath: string) {
  return fileURLToPath(new URL(relativePath, import.meta.url));
}

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: './test/setup.tsx',
    // Run against the source so module mocks (e.g. `fs/promises`) also apply
    // to the code that lives in the shared extraction packages
    alias: {
      '@eloqnt/extractor/_internal': resolveSource(
        '../extractor/src/_internal.ts'
      ),
      '@eloqnt/messages/_internal': resolveSource(
        '../messages/src/_internal.ts'
      ),
      '@eloqnt/messages/_internal-codec': resolveSource(
        '../messages/src/_internal-codec.ts'
      )
    }
  }
});
