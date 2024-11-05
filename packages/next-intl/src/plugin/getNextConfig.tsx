import fs from 'fs';
import path from 'path';
import {NextConfig} from 'next';
import {PluginConfig} from './types.tsx';
import {throwError} from './utils.tsx';

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
      throwError(
        `Could not find i18n config at ${providedPath}, please provide a valid path.`
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

    throwError(
      `Could not locate request configuration module.\n\nThis path is supported by default: ./(src/)i18n/request.{js,jsx,ts,tsx}\n\nAlternatively, you can specify a custom location in your Next.js config:\n\nconst withNextIntl = createNextIntlPlugin(

Alternatively, you can specify a custom location in your Next.js config:

const withNextIntl = createNextIntlPlugin(
  './path/to/i18n/request.tsx'
);`
    );
  }
}
export default function getNextConfig(
  pluginConfig: PluginConfig,
  nextConfig?: NextConfig
) {
  const useTurbo = process.env.TURBOPACK != null;
  const nextIntlConfig: Partial<NextConfig> = {};

  // Assign alias for `next-intl/config`
  if (useTurbo) {
    if (pluginConfig.requestConfig?.startsWith('/')) {
      throwError(
        "Turbopack support for next-intl currently does not support absolute paths, please provide a relative one (e.g. './src/i18n/config.ts').\n\nFound: " +
          pluginConfig.requestConfig
      );
    }

    // `NextConfig['turbo']` is stable in Next.js 15. In case the
    // experimental feature is removed in the future, we should
    // replace this accordingly in a future major version.
    nextIntlConfig.experimental = {
      ...nextConfig?.experimental,
      turbo: {
        ...nextConfig?.experimental?.turbo,
        resolveAlias: {
          ...nextConfig?.experimental?.turbo?.resolveAlias,
          // Turbo aliases don't work with absolute
          // paths (see error handling above)
          'next-intl/config': resolveI18nPath(pluginConfig.requestConfig)
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
        resolveI18nPath(pluginConfig.requestConfig, config.context)
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
