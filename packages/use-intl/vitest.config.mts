import {defineConfig} from 'vitest/config';
import {fileURLToPath} from 'url';
import {resolve, dirname} from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      // Use real source file for `use-intl/format-message`
      'use-intl/format-message': resolve(
        __dirname,
        'src/core/format-message/compile-format.tsx'
      )
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './test/setup.tsx',
    env: {
      TZ: 'Europe/Berlin'
    }
  }
});
