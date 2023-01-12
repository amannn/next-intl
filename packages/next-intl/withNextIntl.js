/* eslint-env node */

const fs = require('fs');
const path = require('path');

module.exports = function withNextIntl(enhancedNextConfig = {}) {
  // eslint-disable-next-line prefer-const
  let {i18nConfig, ...nextConfig} = enhancedNextConfig;

  if (i18nConfig) {
    i18nConfig = path.resolve(i18nConfig);

    if (!fs.existsSync(i18nConfig)) {
      throw new Error(
        `Could not find i18n config at ${i18nConfig}, please provide a valid path for \`i18nConfig\`.`
      );
    }
  } else {
    i18nConfig = [
      './i18n.tsx',
      './i18n.ts',
      './i18n.js',
      './i18n.jsx',
      './src/i18n.tsx',
      './src/i18n.ts',
      './src/i18n.js',
      './src/i18n.jsx'
    ]
      .map((cur) => path.resolve(cur))
      .find((cur) => fs.existsSync(cur));

    if (!i18nConfig) {
      throw new Error(`\n\nCould not locale i18n config. Create one at \`./(src/)i18n.{js,jsx,ts,tsx}\` or specify a custom location via \`i18nConfig\`:
      
module.exports = withNextIntl({
  i18nConfig: './config/i18n.tsx'
});\n`);
    }
  }

  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      config.resolve.alias['next-intl/config'] = require.resolve(i18nConfig);

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }

      return config;
    }
  });
};
