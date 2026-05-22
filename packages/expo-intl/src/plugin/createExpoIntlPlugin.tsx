import {createRequire} from 'module';
import path from 'path';
import {
  type ExtractorConfig,
  getFormatExtension,
  normalizeExtractorConfig,
  normalizeMessagesCatalogPaths
} from 'intl-extractor';
import initExtractionCompiler from './extractor/initExtractionCompiler.js';
import type {
  MetroConfig,
  PluginConfig,
  SerializedTransformerOptions
} from './types.js';
import {findWorkspaceRoot, throwError, warn} from './utils.js';

const requireFn = createRequire(import.meta.url);

const TRANSFORMER_ENV_VAR = '_EXPO_INTL_TRANSFORMER_OPTIONS';
const TRANSFORMER_REQUIRE_PATH = 'expo-intl/transformer';

/**
 * When `precompile: true`, catalogs are compiled to ICU ASTs at build time.
 * The standard `use-intl/format-message` runtime expects raw strings and
 * throws `INVALID_MESSAGE` on arrays, so we redirect to the lightweight
 * `format-only` runtime that knows how to render precompiled ASTs.
 *
 * Mirrors the alias set up by `next-intl`'s `getNextConfig` for Webpack/Turbopack.
 */
const FORMAT_MESSAGE_SPECIFIER = 'use-intl/format-message';
const FORMAT_ONLY_SPECIFIER = 'use-intl/format-message/format-only';

/**
 * Creates an Expo / Metro plugin for `expo-intl`. Signature mirrors
 * `createNextIntlPlugin` so configs are portable between Next.js and Expo.
 *
 * Usage in `metro.config.js`:
 *
 * ```js
 * const { getDefaultConfig } = require('expo/metro-config');
 * const createExpoIntlPlugin = require('expo-intl/plugin').default;
 *
 * const withExpoIntl = createExpoIntlPlugin({
 *   experimental: {
 *     extract: true,
 *     srcPath: './src',
 *     messages: {
 *       path: './messages',
 *       format: 'po',
 *       locales: ['en', 'de'],
 *       sourceLocale: 'en',
 *       precompile: true
 *     }
 *   }
 * });
 *
 * module.exports = withExpoIntl(getDefaultConfig(__dirname));
 * ```
 */
export default function createExpoIntlPlugin(
  pluginConfig: PluginConfig = {}
): (metroConfig: MetroConfig) => MetroConfig {
  return function withExpoIntl(metroConfig: MetroConfig): MetroConfig {
    const projectRoot = process.cwd();
    const isDevelopment = process.env['NODE_ENV'] !== 'production';
    const referenceRoot = pluginConfig.experimental?.referenceRoot
      ? path.resolve(pluginConfig.experimental.referenceRoot)
      : undefined;

    let extractorConfig: ExtractorConfig | undefined;
    const experimental = pluginConfig.experimental;
    if (experimental?.extract) {
      extractorConfig = normalizeExtractorConfig({
        extract: experimental.extract,
        messages: experimental.messages,
        srcPath: experimental.srcPath,
        referenceRoot
      });
    }

    initExtractionCompiler(extractorConfig, {
      projectRoot,
      referenceRoot,
      isDevelopment
    });

    return applyMetroConfig({
      metroConfig,
      pluginConfig,
      extractorConfig,
      projectRoot,
      referenceRoot,
      isDevelopment
    });
  };
}

function applyMetroConfig(args: {
  metroConfig: MetroConfig;
  pluginConfig: PluginConfig;
  extractorConfig: ExtractorConfig | undefined;
  projectRoot: string;
  referenceRoot: string | undefined;
  isDevelopment: boolean;
}): MetroConfig {
  const {metroConfig, pluginConfig, projectRoot, referenceRoot, isDevelopment} =
    args;
  const messages = pluginConfig.experimental?.messages;
  if (!messages) {
    warn(
      "`experimental.messages` is not configured — `expo-intl` won't transform catalog files. " +
        'Add `messages: { path, format, locales, sourceLocale }` to enable.'
    );
    return metroConfig;
  }

  if (metroConfig.transformer?.babelTransformerPath != null) {
    warn(
      'A custom `transformer.babelTransformerPath` is already configured. ' +
        '`expo-intl` will replace it and delegate to `@expo/metro-config/babel-transformer`. ' +
        'If you need to chain a different transformer, copy our transformer source into your project.'
    );
  }

  const extension = getFormatExtension(messages.format);
  const messagesPaths = normalizeMessagesCatalogPaths(messages.path).map(
    (dirPath) => path.resolve(projectRoot, dirPath)
  );

  const serialized: SerializedTransformerOptions = {
    extract: pluginConfig.experimental?.extract != null,
    precompile: messages.precompile === true,
    format: typeof messages.format === 'string' ? messages.format : 'custom',
    customFormat:
      typeof messages.format === 'string'
        ? undefined
        : {
            codec: messages.format.codec,
            extension: messages.format.extension
          },
    messagesPaths,
    extension,
    projectRoot,
    ...(referenceRoot != null && {referenceRoot}),
    isDevelopment
  };

  process.env[TRANSFORMER_ENV_VAR] = JSON.stringify(serialized);

  const next: MetroConfig = {...metroConfig};

  // 1) Wire our custom Babel transformer.
  next.transformer = {
    ...metroConfig.transformer,
    babelTransformerPath: requireTransformerPath()
  };

  // 2) Register the catalog extension (e.g. `po`) so Metro tries to resolve it.
  const extWithoutDot = extension.replace(/^\./, '');
  const existingSourceExts = metroConfig.resolver?.sourceExts ?? [];
  const sourceExts = existingSourceExts.includes(extWithoutDot)
    ? existingSourceExts
    : [...existingSourceExts, extWithoutDot];

  // 3) For monorepos, watch the workspace root + ensure node_modules resolves
  //    against the repo root as well as the project root.
  const watchFolders = new Set(metroConfig.watchFolders ?? []);
  const nodeModulesPaths = new Set(metroConfig.resolver?.nodeModulesPaths ?? []);

  const workspaceRoot = findWorkspaceRoot(projectRoot);
  if (workspaceRoot && workspaceRoot !== projectRoot) {
    watchFolders.add(workspaceRoot);
    nodeModulesPaths.add(path.join(workspaceRoot, 'node_modules'));
  }

  next.resolver = {
    ...metroConfig.resolver,
    sourceExts,
    nodeModulesPaths: [...nodeModulesPaths]
  };

  // 4) When `precompile: true`, swap `use-intl/format-message` for the
  //    `format-only` runtime that understands precompiled ICU ASTs.
  if (messages.precompile) {
    const previousResolveRequest = metroConfig.resolver?.resolveRequest as
      | MetroResolveRequest
      | undefined;
    next.resolver.resolveRequest = createFormatMessageRedirect({
      previousResolveRequest
    });
  }

  next.watchFolders = [...watchFolders];

  if (isDevelopment) {
    // No-op; reserved for future dev-mode wiring (e.g. publishing watcher
    // events through Metro's HMR channel).
  }

  return next;
}

function requireTransformerPath(): string {
  try {
    return requireFn.resolve(TRANSFORMER_REQUIRE_PATH);
  } catch (error) {
    throwError(
      `Could not resolve '${TRANSFORMER_REQUIRE_PATH}'. ` +
        `Make sure 'expo-intl' is installed.\n${(error as Error).message}`
    );
  }
}

interface MetroResolutionResult {
  readonly type: string;
  readonly filePath?: string;
}

interface MetroResolveContext {
  readonly originModulePath: string;
  /**
   * Metro's built-in resolver. Always present inside a `resolveRequest`
   * callback; calling it delegates to the default behavior without recursing
   * into the user-installed `resolveRequest`.
   */
  readonly resolveRequest: MetroResolveRequest;
  readonly [key: string]: unknown;
}

type MetroResolveRequest = (
  context: MetroResolveContext,
  moduleName: string,
  platform: string | null
) => MetroResolutionResult;

function createFormatMessageRedirect({
  previousResolveRequest
}: {
  readonly previousResolveRequest: MetroResolveRequest | undefined;
}): MetroResolveRequest {
  return function resolveRequest(context, moduleName, platform) {
    const effectiveName =
      moduleName === FORMAT_MESSAGE_SPECIFIER ? FORMAT_ONLY_SPECIFIER : moduleName;

    if (previousResolveRequest) {
      return previousResolveRequest(context, effectiveName, platform);
    }
    return context.resolveRequest(context, effectiveName, platform);
  };
}
