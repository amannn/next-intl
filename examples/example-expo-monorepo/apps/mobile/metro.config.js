// Learn more https://docs.expo.dev/guides/customizing-metro
const {getDefaultConfig} = require('expo/metro-config');
const createExpoIntlPlugin = require('expo-intl/plugin');

const withExpoIntl = createExpoIntlPlugin({
  experimental: {
    // Single shared catalog at the workspace root: both apps and the shared
    // `packages/ui` write/read from `examples/example-expo-monorepo/messages/`.
    extract: {path: '../../messages'},
    srcPath: ['./src', '../web/src', '../../packages/ui/src'],
    messages: {
      path: '../../messages',
      format: 'po',
      locales: ['en', 'de'],
      sourceLocale: 'en',
      precompile: true
    }
  }
});

module.exports = withExpoIntl(getDefaultConfig(__dirname));
