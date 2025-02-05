import type {NextConfig} from 'next';
import createMessagesDeclarations from './createMessagesDeclarations.js';
import getNextConfig from './getNextConfig.js';
import type {PluginConfig} from './types.js';
import {warn} from './utils.js';

function initPlugin(
  pluginConfig: PluginConfig,
  nextConfig?: NextConfig
): NextConfig {
  if (nextConfig?.i18n != null) {
    warn(
      "\n[next-intl] An `i18n` property was found in your Next.js config. This likely causes conflicts and should therefore be removed if you use the App Router.\n\nIf you're in progress of migrating from the Pages Router, you can refer to this example: https://next-intl.dev/examples#app-router-migration\n"
    );
  }

  if (pluginConfig.experimental?.createMessagesDeclarations) {
    createMessagesDeclarations(
      pluginConfig.experimental.createMessagesDeclarations
    );
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
