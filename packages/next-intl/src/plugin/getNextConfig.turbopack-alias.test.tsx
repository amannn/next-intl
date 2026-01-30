import path from 'path';
import {afterEach, describe, expect, it, vi} from 'vitest';

vi.mock('module', async (importOriginal) => {
  const actual = await importOriginal<typeof import('module')>();

  return {
    ...actual,
    createRequire(...args: Array<unknown>) {
      // Keep Node’s normal resolution behavior, but stub the one subpath we need
      // for this test. The `use-intl` package isn't built in this workspace
      // setup, so `require.resolve` would otherwise fail.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const require = actual.createRequire(...(args as any));
      const originalResolve = require.resolve.bind(require);

      require.resolve = (request: string) => {
        if (request === 'use-intl/format-message/format-only') {
          return '/workspace/node_modules/use-intl/dist/esm/production/format-message/format-only.js';
        }

        return originalResolve(request);
      };

      return require;
    }
  };
});

describe('getNextConfig (Turbopack aliases)', () => {
  const originalTurboEnvValue = process.env.TURBOPACK;

  afterEach(() => {
    process.env.TURBOPACK = originalTurboEnvValue;
    vi.restoreAllMocks();
  });

  it('normalizes `use-intl/format-message` alias paths to use forward slashes', async () => {
    process.env.TURBOPACK = '1';

    vi.spyOn(path, 'relative').mockReturnValue(
      'node_modules\\.pnpm\\use-intl@4.8.0\\node_modules\\use-intl\\dist\\esm\\production\\format-message\\format-only.js'
    );

    const {default: getNextConfig} = await import('./getNextConfig.js');

    const config = getNextConfig({
      requestConfig: './test/fixtures/i18n/request.ts',
      experimental: {
        messages: {
          format: 'json',
          locales: 'infer',
          path: './messages',
          precompile: true
        }
      }
    });

    const alias = config.turbopack?.resolveAlias?.['use-intl/format-message'];
    expect(alias).toBe(
      './node_modules/.pnpm/use-intl@4.8.0/node_modules/use-intl/dist/esm/production/format-message/format-only.js'
    );
    expect(alias).not.toContain('\\');
  });
});

