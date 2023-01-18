/* eslint-env node */

// TODO: Only available for backwards compatibility
// during the beta, remove for stable release

const {initPlugin} = require('./plugin');

module.exports = function withNextIntl(enhancedNextConfig) {
  console.warn(
    `\n\nDEPRECATION WARNING: The \`withNextIntl()\` function is deprecated and will be removed in the stable release of next-intl. Please use \`next-intl/plugin\` instead. See https://next-intl-docs.vercel.app/docs/next-13/server-components\n\n`
  );
  return initPlugin(enhancedNextConfig.i18nConfig, enhancedNextConfig);
};
