/* global module */

/**
 * @type {import('dts-cli').DtsConfig}
 */
module.exports = {
  rollup(config) {
    // if (config.output.format === 'esm') {
    //   config.output.preserveModules = true;
    // }
    return config;
  }
};
