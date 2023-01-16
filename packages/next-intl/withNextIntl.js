/* eslint-env node */

// TODO: Only available for backwards compatibility
// during the beta, remove for stable release

const {initPlugin} = require('./plugin');

module.exports = function withNextIntl(enhancedNextConfig) {
  return initPlugin(enhancedNextConfig.i18nConfig, enhancedNextConfig);
};
