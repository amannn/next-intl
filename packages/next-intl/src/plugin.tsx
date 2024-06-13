/* eslint-env node */

import fs from 'fs';
import path from 'path';
import type {NextConfig} from 'next';

function resolveI18nPath(providedPath?: string, cwd?: string) {
  function resolvePath(pathname: string) {
    const parts = [];
    if (cwd) parts.push(cwd);
    parts.push(pathname);
    return path.resolve(...parts);
  }

  function pathExists(pathname: string) {
    return fs.existsSync(resolvePath(pathname));
  }

  if (providedPath) {
    if (!pathExists(providedPath)) {
      throw new Error(
        `Could not find i18n config at ${providedPath}, please provide a valid path.`
      );
    }
    return providedPath;
  } else {
    for (const candidate of [
      './i18n.tsx',
      './i18n.ts',
      './i18n.js',
      './i18n.jsx',
      './src/i18n.tsx',
      './src/i18n.ts',
      './src/i18n.js',
      './src/i18n.jsx'
    ]) {
      if (pathExists(candidate)) {
        return candidate;
      }
    }

    throw new Error(`\n\nCould not locate i18n config. Create one at \`./(src/)i18n.{js,jsx,ts,tsx}\` or specify a custom location:

const withNextIntl = require('next-intl/plugin')(
  './path/to/i18n.tsx'
);

module.exports = withNextIntl({
  // Other Next.js configuration ...
});\n`);
  }
}

function initPlugin(i18nPath?: string, nextConfig?: NextConfig): NextConfig {
  if (nextConfig?.i18n != null) {
    console.warn(
      "\nnext-intl has found an `i18n` config in your next.config.js. This likely causes conflicts and should therefore be removed if you use the App Router.\n\nIf you're in progress of migrating from the `pages` folder, you can refer to this example: https://github.com/amannn/next-intl/tree/main/examples/example-app-router-migration\n"
    );
  }

  const useTurbo = process.env.TURBOPACK != null;

  let nextIntlConfig;
  if (useTurbo) {
    if (i18nPath && i18nPath.startsWith('/')) {
      throw new Error(
        "Turbopack support for next-intl currently does not support absolute paths, please provide a relative one (e.g. './src/i18n/config.ts').\n\nFound: " +
          i18nPath +
          '\n'
      );
    }

    nextIntlConfig = {
      experimental: {
        ...nextConfig?.experimental,
        turbo: {
          ...nextConfig?.experimental?.turbo,
          resolveAlias: {
            ...nextConfig?.experimental?.turbo?.resolveAlias,
            // Turbo aliases don't work with absolute
            // paths (see error handling above)
            'next-intl/config': resolveI18nPath(i18nPath)
          }
        }
      }
    };
  } else {
    nextIntlConfig = {
      webpack(
        ...[config, options]: Parameters<NonNullable<NextConfig['webpack']>>
      ) {
        // Webpack requires absolute paths
        config.resolve.alias['next-intl/config'] = path.resolve(
          config.context,
          resolveI18nPath(i18nPath, config.context)
        );

        if (typeof nextConfig?.webpack === 'function') {
          return nextConfig.webpack(config, options);
        }

        return config;
      }
    };
  }

  return Object.assign({}, nextConfig, nextIntlConfig);
}

export default function createNextIntlPlugin(i18nPath?: string) {
  return function withNextIntl(nextConfig?: NextConfig) {
    return initPlugin(i18nPath, nextConfig);
  };
}
