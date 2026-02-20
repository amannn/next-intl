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
import SourceFileFilter from '../extractor/source/SourceFileFilter.js';
import type {CatalogLoaderConfig, ExtractorConfig} from '../extractor/types.js';
import {isDevelopmentOrNextBuild} from './config.js';
import {hasStableTurboConfig, isNextJs16OrHigher} from './nextFlags.js';
import type {ManifestLoaderConfig} from './treeShaking/manifestLoaderConfig.js';
import type {PluginConfig} from './types.js';
import {throwError} from './utils.js';

const require = createRequire(import.meta.url);

function withExtensions(localPath: string) {
  return SourceFileFilter.EXTENSIONS.map((ext) => `${localPath}.${ext}`);
}

function normalizeTurbopackAliasPath(pathname: string) {
  // Turbopack alias targets should use forward slashes; Windows backslashes can
  // break resolution in dev (see `next-intl/config` alias path style).
  return pathname.replace(/\\/g, '/');
}

function normalizeSrcPath(srcPath: string) {
  const normalized = srcPath.replace(/[/\\]+$/, '');
  return normalized || srcPath;
}

function getConfiguredSrcPaths(srcPath: string | Array<string>): Array<string> {
  const srcPaths = Array.isArray(srcPath) ? srcPath : [srcPath];
  return srcPaths.map((currentPath) =>
    normalizeTurbopackAliasPath(normalizeSrcPath(currentPath))
  );
}

function getPathCondition(paths: Array<string>): string {
  return paths.length === 1 ? paths[0] : `{${paths.join(',')}}`;
}

function getAppSourcePaths(srcPaths: Array<string>): Array<string> {
  return srcPaths.flatMap((srcPath) =>
    SourceFileFilter.EXTENSIONS.flatMap((ext) => [
      `${srcPath}/**/*.${ext}`,
      `${srcPath}/*.${ext}`
    ])
  );
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
    // We use the `isNextDevOrBuild` condition to avoid throwing errors
    // if `next.config.ts` is read by a non-Next.js process.
    // https://github.com/amannn/next-intl/discussions/2209#discussioncomment-15650927
    if (isDevelopmentOrNextBuild && !pathExists(providedPath)) {
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

    if (isDevelopmentOrNextBuild) {
      throwError(
        `Could not locate request configuration module.\n\nThis path is supported by default: ./(src/)i18n/request.{js,jsx,ts,tsx}\n\nAlternatively, you can specify a custom location in your Next.js config:\n\nconst withNextIntl = createNextIntlPlugin(\n  './path/to/i18n/request.tsx'\n);`
      );
    }

    // Default as fallback
    if (pathExists('./src')) {
      return './src/i18n/request.ts';
    } else {
      return './i18n/request.ts';
    }
  }
}

export default function getNextConfig(
  pluginConfig: PluginConfig,
  nextConfig?: NextConfig
) {
  const useTurbo = process.env.TURBOPACK != null;

  // `experimental-analyze` doesn’t set the TURBOPACK env param. Since Next.js
  // 16 doesn't print a warning when we configure both Turbo- and Webpack, just
  // always configure Turbopack just in case.
  const shouldConfigureTurbo = useTurbo || isNextJs16OrHigher();

  const nextIntlConfig: Partial<NextConfig> = {};

  function getExtractMessagesLoaderConfig() {
    const experimental = pluginConfig.experimental!;
    if (!experimental.srcPath || !pluginConfig.experimental?.messages) {
      throwError(
        '`srcPath` and `messages` are required when using `extractor`.'
      );
    }
    return {
      loader: 'next-intl/extractor/extractionLoader',
      options: {
        srcPath: experimental.srcPath,
        sourceLocale: experimental.extract!.sourceLocale,
        messages: pluginConfig.experimental.messages
      } satisfies ExtractorConfig as TurbopackLoaderOptions
    };
  }

  function getCatalogLoaderConfig() {
    const options: CatalogLoaderConfig = {
      messages: pluginConfig.experimental!.messages!
    };
    if (pluginConfig.experimental?.extract) {
      options.sourceLocale = pluginConfig.experimental.extract.sourceLocale;
      options.srcPath = pluginConfig.experimental.srcPath;
    }
    return {
      loader: 'next-intl/extractor/catalogLoader',
      options: options satisfies CatalogLoaderConfig as TurbopackLoaderOptions
    };
  }

  function getManifestLoaderConfig(): {
    loader: string;
    options: TurbopackLoaderOptions;
  } {
    const srcPaths = getConfiguredSrcPaths(pluginConfig.experimental!.srcPath!);
    return {
      loader: 'next-intl/treeShaking/manifestLoader',
      options: {
        projectRoot: process.cwd(),
        srcPaths
      } satisfies ManifestLoaderConfig as TurbopackLoaderOptions
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

  // Validate messages config
  if (pluginConfig.experimental?.messages) {
    const messages = pluginConfig.experimental.messages;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- For non-TS consumers
    if (!messages.format) {
      throwError('`format` is required when using `messages`.');
    }
    if (!messages.path) {
      throwError('`path` is required when using `messages`.');
    }
  }

  if (
    pluginConfig.experimental?.treeShaking &&
    !pluginConfig.experimental.srcPath
  ) {
    throwError('`experimental.srcPath` is required when using `treeShaking`.');
  }

  if (shouldConfigureTurbo) {
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
    const resolveAlias: Record<string, string> = {
      // Turbo aliases don't work with absolute
      // paths (see error handling above)
      'next-intl/config': resolveI18nPath(pluginConfig.requestConfig)
    };

    // Add alias for precompiled message formatting
    if (pluginConfig.experimental?.messages?.precompile) {
      // Workaround for https://github.com/vercel/next.js/issues/88540
      let formatOnlyPath = path.relative(
        process.cwd(),
        require.resolve('use-intl/format-message/format-only')
      );

      // Turbopack seems to require this, otherwise `use-intl/format-message` is
      // still bundled (despite the code correctly calling into `format-only`).
      // Note that in this monorepo this is not necessary, because we'll end
      // up with a path like `../…` — but for actual consumers this is required.
      if (!formatOnlyPath.startsWith('.')) {
        formatOnlyPath = `./${formatOnlyPath}`;
      }

      resolveAlias['use-intl/format-message'] =
        normalizeTurbopackAliasPath(formatOnlyPath);
    }

    // Add loaders
    let rules: Record<string, TurbopackRuleConfigCollection> | undefined;

    // Add loader for extractor
    if (pluginConfig.experimental?.extract) {
      if (!isNextJs16OrHigher()) {
        throwError('Message extraction requires Next.js 16 or higher.');
      }
      rules ??= getTurboRules();
      const srcPaths = getConfiguredSrcPaths(
        pluginConfig.experimental.srcPath!
      );
      addTurboRule(rules!, `*.{${SourceFileFilter.EXTENSIONS.join(',')}}`, {
        loaders: [getExtractMessagesLoaderConfig()],
        condition: {
          // Note: We don't need `not: 'foreign'`, because this is
          // implied by the filter based on `srcPath`.
          path: getPathCondition(srcPaths.map((srcPath) => `${srcPath}/**/*`)),
          content: /(useExtracted|getExtracted)/
        }
      });
    }

    // Add manifest loader
    if (pluginConfig.experimental?.treeShaking) {
      if (!isNextJs16OrHigher()) {
        throwError('Tree-shaking requires Next.js 16 or higher.');
      }
      rules ??= getTurboRules();
      const manifestLoaderConfig = getManifestLoaderConfig();
      const srcPaths = getConfiguredSrcPaths(
        pluginConfig.experimental.srcPath!
      );
      addTurboRule(rules!, '*.{ts,tsx}', {
        loaders: [manifestLoaderConfig],
        condition: {
          path: getPathCondition(getAppSourcePaths(srcPaths)),
          content:
            /messages\s*=\s*["']infer["']|messages\s*=\s*\{\s*["']infer["']\s*\}/
        }
      });
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
  }

  if (!useTurbo) {
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
      // Add alias for precompiled message formatting
      if (pluginConfig.experimental?.messages?.precompile) {
        // Use require.resolve to get the actual file path, since
        // bundlers don't properly resolve package subpath exports
        // when used as alias targets
        (config.resolve.alias as Record<string, string>)[
          'use-intl/format-message'
        ] = require.resolve('use-intl/format-message/format-only');
      }

      // Add manifest loader
      if (pluginConfig.experimental?.treeShaking) {
        if (!config.module) config.module = {};
        if (!config.module.rules) config.module.rules = [];
        const srcPath = pluginConfig.experimental.srcPath;
        const include = Array.isArray(srcPath)
          ? srcPath.map((cur) => path.resolve(config.context!, cur))
          : path.resolve(config.context!, srcPath || '');
        config.module.rules.push({
          test: new RegExp(`\\.(${SourceFileFilter.EXTENSIONS.join('|')})$`),
          include,
          use: [getManifestLoaderConfig()]
        });
      }

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
