/* global module */

/**
 * @type {import('dts-cli').DtsOptions}
 */
module.exports = {
  rollup(config) {
    // Enable tree shaking detection in rollup / Bundlephobia
    if (config.output.format === 'esm') {
      config.output.preserveModules = true;
    }
    return config;
  }
};
