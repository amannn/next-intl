import fs from 'fs';
import {createRequire} from 'module';
import path from 'path';
import type {NextConfig} from 'next';
import type {
  TurbopackLoaderOptions,
  TurbopackRuleConfigCollection,
  TurbopackRuleConfigItem
} from 'next/dist/server/config-shared.js';
import type {Configuration} from 'webpack';
import {getFormatExtension} from '../extractor/format/index.js';
import type {CatalogLoaderConfig} from '../extractor/types.js';
import {hasStableTurboConfig, isNextJs16OrHigher} from './nextFlags.js';
import type {PluginConfig} from './types.js';
import {throwError} from './utils.js';

const require = createRequire(import.meta.url);

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
  const isDevelopment = process.env.NODE_ENV === 'development';

  function getSwcPluginConfig() {
    return [
      require.resolve('next-intl-swc-plugin-extractor'),
      {
        isDevelopment
      }
    ] as [string, Record<string, unknown>];
  }

  function getCatalogLoaderConfig() {
    return {
      loader: 'next-intl/extractor/catalogLoader',
      options: {
        messages: pluginConfig.experimental!.messages!
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
    const experimentalConfig: Partial<NextConfig['experimental']> = {
      ...nextConfig?.experimental
    };

    // Add SWC plugin for extractor transformation
    if (pluginConfig.experimental?.extract) {
      if (!isNextJs16OrHigher()) {
        throwError('Message extraction requires Next.js 16 or higher.');
      }
      experimentalConfig.swcPlugins = [
        ...(nextConfig?.experimental?.swcPlugins ?? []),
        getSwcPluginConfig()
      ];
    }

    // Add loader for catalog
    if (pluginConfig.experimental?.messages) {
      if (!isNextJs16OrHigher()) {
        throwError('Message catalog loading requires Next.js 16 or higher.');
      }
      rules ??= getTurboRules();
      const extension = getFormatExtension(
        pluginConfig.experimental.messages.format
      );
      addTurboRule(rules!, `*${extension}`, {
        loaders: [getCatalogLoaderConfig()],
        condition: {
          path: `${pluginConfig.experimental.messages.path}/**/*`
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
      if (Object.keys(experimentalConfig).length > 0) {
        nextIntlConfig.experimental = experimentalConfig;
      }
    } else {
      nextIntlConfig.experimental = {
        ...experimentalConfig,
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
    // Add SWC plugin for extractor transformation (webpack)
    if (pluginConfig.experimental?.extract) {
      if (!isNextJs16OrHigher()) {
        throwError('Message extraction requires Next.js 16 or higher.');
      }
      nextIntlConfig.experimental = {
        ...nextIntlConfig.experimental,
        ...nextConfig?.experimental,
        swcPlugins: [
          ...(nextConfig?.experimental?.swcPlugins ?? []),
          getSwcPluginConfig()
        ]
      };
    }

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

      // Add loader for catalog
      if (pluginConfig.experimental?.messages) {
        if (!config.module) config.module = {};
        if (!config.module.rules) config.module.rules = [];
        const extension = getFormatExtension(
          pluginConfig.experimental.messages.format
        );
        config.module.rules.push({
          test: new RegExp(`${extension.replace(/\./g, '\\.')}$`),
          include: path.resolve(
            config.context!,
            pluginConfig.experimental.messages.path
          ),
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
