/* eslint-env node */

import fs from 'fs';
import path from 'path';
import type {NextConfig} from 'next';

function withExtensions(localPath: string) {
  return [
    `${localPath}.ts`,
    `${localPath}.tsx`,
    `${localPath}.js`,
    `${localPath}.jsx`
  ];
}

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
        `[next-intl] Could not find i18n config at ${providedPath}, please provide a valid path.`
      );
    }
    return providedPath;
  } else {
    for (const candidate of [
      ...withExtensions('./i18n/request'),
      ...withExtensions('./src/i18n/request')
    ]) {
      if (pathExists(candidate)) {
        return candidate;
      }
    }

    throw new Error(`\n[next-intl] Could not locate request configuration module.

This path is supported by default: ./(src/)i18n/request.{js,jsx,ts,tsx}

Alternatively, you can specify a custom location in your Next.js config:

const withNextIntl = createNextIntlPlugin(
  './path/to/i18n/request.tsx'
);\n`);
  }
}

function initPlugin(i18nPath?: string, nextConfig?: NextConfig): NextConfig {
  if (nextConfig?.i18n != null) {
    console.warn(
      "\n[next-intl] An `i18n` property was found in your Next.js config. This likely causes conflicts and should therefore be removed if you use the App Router.\n\nIf you're in progress of migrating from the Pages Router, you can refer to this example: https://next-intl-docs.vercel.app/examples#app-router-migration\n"
    );
  }

  const useTurbo = process.env.TURBOPACK != null;

  const nextIntlConfig: Partial<NextConfig> = {};

  // Assign alias for `next-intl/config`
  if (useTurbo) {
    if (i18nPath?.startsWith('/')) {
      throw new Error(
        "[next-intl] Turbopack support for next-intl currently does not support absolute paths, please provide a relative one (e.g. './src/i18n/config.ts').\n\nFound: " +
          i18nPath +
          '\n'
      );
    }
    nextIntlConfig.experimental = {
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
    };
  } else {
    nextIntlConfig.webpack = function webpack(
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
    };
  }

  // Forward config
  nextIntlConfig.env = {
    ...nextConfig?.env,
    _next_intl_trailing_slash: nextConfig?.trailingSlash ? 'true' : undefined
  };

  return Object.assign({}, nextConfig, nextIntlConfig);
}

export default function createNextIntlPlugin(i18nPath?: string) {
  return function withNextIntl(nextConfig?: NextConfig) {
    return initPlugin(i18nPath, nextConfig);
  };
}
