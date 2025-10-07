import fs from 'fs';
import path from 'path';
import type {NextConfig} from 'next';
import type {
  TurbopackRuleConfigItem,
  TurbopackRuleConfigItemOrShortcut
} from 'next/dist/server/config-shared.js';
import type {Configuration} from 'webpack';
import SourceFileFilter from './extractor/source/SourceFileFilter.js';
import type {ExtractorConfig} from './extractor/types.js';
import hasStableTurboConfig from './hasStableTurboConfig.js';
import type {PluginConfig} from './types.js';
import {throwError} from './utils.js';

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

  function getExtractMessagesLoaderConfig() {
    const experimental = pluginConfig.experimental!;
    if (!experimental.src || !experimental.messages) {
      throwError('`src` and `messages` are required when using `extractor`.');
    }
    return {
      loader: 'next-intl/extractor/extractMessagesLoader',
      options: {
        src: experimental.src,
        sourceLocale: experimental.extractor.sourceLocale,
        messages: experimental.messages
      } satisfies ExtractorConfig
    };
  }

  if (useTurbo) {
    if (pluginConfig.requestConfig?.startsWith('/')) {
      throwError(
        "Turbopack support for next-intl currently does not support absolute paths, please provide a relative one (e.g. './src/i18n/config.ts').\n\nFound: " +
          pluginConfig.requestConfig
      );
    }

    // Assign alias for `next-intl/config`
    const resolveAlias = {
      // Turbo aliases don't work with absolute
      // paths (see error handling above)
      'next-intl/config': resolveI18nPath(pluginConfig.requestConfig)
    };

    // Add loader for extractor
    let rules: Record<string, TurbopackRuleConfigItemOrShortcut> | undefined;
    if (pluginConfig.experimental?.extractor) {
      const sourceGlob = `*.{${SourceFileFilter.EXTENSIONS.join(',')}}`;
      rules =
        nextConfig?.turbopack?.rules ||
        nextConfig?.experimental?.turbo?.rules ||
        {};
      const sourceRule: TurbopackRuleConfigItem = {
        loaders: [getExtractMessagesLoaderConfig()]
      };
      if (rules[sourceGlob]) {
        if (Array.isArray(rules[sourceGlob])) {
          // @ts-expect-error -- This is only supported in Next.js 16
          rules[sourceGlob].push(sourceRule);
        } else {
          // @ts-expect-error -- This is only supported in Next.js 16
          rules[sourceGlob].push(sourceRule);
        }
      } else {
        rules[sourceGlob] = sourceRule;
      }
    }

    if (hasStableTurboConfig && !nextConfig?.experimental?.turbo) {
      nextIntlConfig.turbopack = {
        ...nextConfig?.turbopack,
        rules,
        resolveAlias: {
          ...nextConfig?.turbopack?.resolveAlias,
          ...resolveAlias
        }
      };
    } else {
      nextIntlConfig.experimental = {
        ...nextConfig?.experimental,
        turbo: {
          ...nextConfig?.experimental?.turbo,
          resolveAlias: {
            ...nextConfig?.experimental?.turbo?.resolveAlias,
            ...resolveAlias
          }
        }
      };
    }
  } else {
    nextIntlConfig.webpack = function webpack(config: Configuration, context) {
      if (!config.resolve) config.resolve = {};
      if (!config.resolve.alias) config.resolve.alias = {};

      // Assign alias for `next-intl/config`
      // (Webpack requires absolute paths)
      (config.resolve.alias as Record<string, string>)['next-intl/config'] =
        path.resolve(
          config.context!,
          resolveI18nPath(pluginConfig.requestConfig, config.context)
        );

      // Add loader for extractor
      if (pluginConfig.experimental?.extractor) {
        if (!config.module) config.module = {};
        if (!config.module.rules) config.module.rules = [];
        config.module.rules.push({
          test: new RegExp(`\\.(${SourceFileFilter.EXTENSIONS.join('|')})$`),
          use: [getExtractMessagesLoaderConfig()]
        });
      }

      if (typeof nextConfig?.webpack === 'function') {
        return nextConfig.webpack(config, context);
      }

      return config;
    };
  }

  // Forward config
  if (nextConfig?.trailingSlash) {
    nextIntlConfig.env = {
      ...nextConfig.env,
      _next_intl_trailing_slash: 'true'
    };
  }

  return Object.assign({}, nextConfig, nextIntlConfig);
}
