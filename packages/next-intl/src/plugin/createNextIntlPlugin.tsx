import type {NextConfig} from 'next';
import createMessagesDeclaration from './declaration/index.js';
import initExtractionCompiler from './extractor/initExtractionCompiler.js';
import getNextConfig from './getNextConfig.js';
import type {PluginConfig} from './types.js';
import {warn} from './utils.js';

function initPlugin(
  pluginConfig: PluginConfig,
  nextConfig?: NextConfig
): NextConfig {
  if (nextConfig?.i18n != null) {
    warn(
      "An `i18n` property was found in your Next.js config. This likely causes conflicts and should therefore be removed if you use the App Router.\n\nIf you're in progress of migrating from the Pages Router, you can refer to this example: https://next-intl.dev/examples#app-router-migration\n"
    );
  }

  const skipWatchers = isNextTelemetryDetachedFlushProcess();

  const messagesPathOrPaths =
    pluginConfig.experimental?.createMessagesDeclaration;
  if (messagesPathOrPaths && !skipWatchers) {
    createMessagesDeclaration(
      typeof messagesPathOrPaths === 'string'
        ? [messagesPathOrPaths]
        : messagesPathOrPaths
    );
  }

  if (!skipWatchers) {
    initExtractionCompiler(pluginConfig);
  }

  return getNextConfig(pluginConfig, nextConfig);
}

export default function createNextIntlPlugin(
  i18nPathOrConfig: string | PluginConfig = {}
) {
  const config =
    typeof i18nPathOrConfig === 'string'
      ? {requestConfig: i18nPathOrConfig}
      : i18nPathOrConfig;
  return function withNextIntl(nextConfig?: NextConfig) {
    return initPlugin(config, nextConfig);
  };
}

/**
 * Next runs `telemetry/detached-flush.js` in a detached process to flush telemetry
 * (often when `next dev` exits). That loads dev `next.config` with inherited
 * `NODE_ENV=development`, which would otherwise start orphan plugin watchers.
 */
function isNextTelemetryDetachedFlushProcess(): boolean {
  const scriptPath = process.argv[1];
  if (!scriptPath) return false;
  const normalized = scriptPath.replace(/\\/g, '/');
  return normalized.includes('/telemetry/detached-flush');
}
