import fs from 'fs';
import path from 'path';
import type {NextConfig} from 'next';
import type {
  TurbopackLoaderOptions,
  TurbopackRuleConfigCollection,
  TurbopackRuleConfigItem
} from 'next/dist/server/config-shared.js';
import type {Configuration} from 'webpack';
import {getCodecExtension} from '../extractor/codecs/utils.js';
import SourceFileFilter from '../extractor/source/SourceFileFilter.js';
import type {
  CatalogLoaderConfig,
  ExtractorConfig,
  MessagesCodec,
  MessagesConfig
} from '../extractor/types.js';
import {hasStableTurboConfig, isNextJs16OrHigher} from './nextFlags.js';
import type {PluginConfig} from './types.js';
import {throwError, warn} from './utils.js';

function normalizeMessagesConfig(
  messages: MessagesConfig & {format?: MessagesCodec}
): MessagesConfig {
  if ('format' in messages) {
    warn('`messages.format` is deprecated, use `messages.codec` instead.');
    return {
      path: messages.path,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      codec: messages.codec ?? messages.format,
      locales: messages.locales
    };
  }

  return {
    path: messages.path,
    codec: messages.codec!,
    locales: messages.locales
  };
}

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
  const projectRoot = process.cwd();

  const normalizedMessages = pluginConfig.experimental?.messages
    ? normalizeMessagesConfig(pluginConfig.experimental.messages)
    : undefined;

  function getExtractMessagesLoaderConfig() {
    const experimental = pluginConfig.experimental!;
    if (!experimental.srcPath || !normalizedMessages) {
      throwError(
        '`srcPath` and `messages` are required when using `extractor`.'
      );
    }
    return {
      loader: 'next-intl/extractor/extractionLoader',
      options: {
        srcPath: experimental.srcPath,
        sourceLocale: experimental.extract!.sourceLocale,
        messages: normalizedMessages
      } satisfies ExtractorConfig as TurbopackLoaderOptions
    };
  }

  function getCatalogLoaderConfig() {
    return {
      loader: 'next-intl/extractor/catalogLoader',
      options: {
        messages: normalizedMessages!
      } satisfies CatalogLoaderConfig as TurbopackLoaderOptions
    };
  }

  function getTurboRules() {
    return (
      nextConfig?.turbopack?.rules ||
      // @ts-expect-error -- For Next.js <16
      nextConfig?.experimental?.turbo?.rules ||
      {}
    );
  }

  function addTurboRule(
    rules: Record<string, TurbopackRuleConfigCollection>,
    glob: string,
    rule: TurbopackRuleConfigItem
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (rules[glob]) {
      if (Array.isArray(rules[glob])) {
        rules[glob].push(rule);
      } else {
        rules[glob] = [rules[glob], rule];
      }
    } else {
      rules[glob] = rule;
    }
  }

  if (useTurbo) {
    if (
      pluginConfig.requestConfig &&
      path.isAbsolute(pluginConfig.requestConfig)
    ) {
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

    // Add loaders
    let rules: Record<string, TurbopackRuleConfigCollection> | undefined;

    // Add loader for extractor
    if (pluginConfig.experimental?.extract) {
      if (!isNextJs16OrHigher()) {
        throwError('Message extraction requires Next.js 16 or higher.');
      }
      rules ??= getTurboRules();
      const srcPaths = (
        Array.isArray(pluginConfig.experimental.srcPath!)
          ? pluginConfig.experimental.srcPath!
          : [pluginConfig.experimental.srcPath!]
      ).map((srcPath) =>
        srcPath.endsWith('/') ? srcPath.slice(0, -1) : srcPath
      );
      addTurboRule(rules!, `*.{${SourceFileFilter.EXTENSIONS.join(',')}}`, {
        loaders: [getExtractMessagesLoaderConfig()],
        condition: {
          // Note: We don't need `not: 'foreign'`, because this is
          // implied by the filter based on `srcPath`.
          path: `{${srcPaths.join(',')}}` + '/**/*',
          content: /(useExtracted|getExtracted)/
        }
      });
    }

    // Add loader for catalog
    if (normalizedMessages) {
      if (!isNextJs16OrHigher()) {
        throwError('Message catalog loading requires Next.js 16 or higher.');
      }
      rules ??= getTurboRules();
      const codecExtension = getCodecExtension(
        normalizedMessages.codec,
        projectRoot
      );
      addTurboRule(rules!, `*.${codecExtension}`, {
        loaders: [getCatalogLoaderConfig()],
        condition: {
          path: `${normalizedMessages.path}/**/*`
        },
        as: '*.js'
      });
    }

    if (
      hasStableTurboConfig() &&
      // @ts-expect-error -- For Next.js <16
      !nextConfig?.experimental?.turbo
    ) {
      nextIntlConfig.turbopack = {
        ...nextConfig?.turbopack,
        ...(rules && {rules}),
        resolveAlias: {
          ...nextConfig?.turbopack?.resolveAlias,
          ...resolveAlias
        }
      };
    } else {
      nextIntlConfig.experimental = {
        ...nextConfig?.experimental,
        // @ts-expect-error -- For Next.js <16
        turbo: {
          // @ts-expect-error -- For Next.js <16
          ...nextConfig?.experimental?.turbo,
          ...(rules && {rules}),
          resolveAlias: {
            // @ts-expect-error -- For Next.js <16
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
      if (pluginConfig.experimental?.extract) {
        if (!config.module) config.module = {};
        if (!config.module.rules) config.module.rules = [];
        const srcPath = pluginConfig.experimental.srcPath;
        config.module.rules.push({
          test: new RegExp(`\\.(${SourceFileFilter.EXTENSIONS.join('|')})$`),
          include: Array.isArray(srcPath)
            ? srcPath.map((cur) => path.resolve(config.context!, cur))
            : path.resolve(config.context!, srcPath || ''),
          use: [getExtractMessagesLoaderConfig()]
        });
      }

      // Add loader for catalog
      if (normalizedMessages) {
        if (!config.module) config.module = {};
        if (!config.module.rules) config.module.rules = [];
        const codecExtension = getCodecExtension(
          normalizedMessages.codec,
          projectRoot
        );
        config.module.rules.push({
          test: new RegExp(`\\.${codecExtension}$`),
          include: path.resolve(config.context!, normalizedMessages.path),
          use: [getCatalogLoaderConfig()],
          type: 'javascript/auto'
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
