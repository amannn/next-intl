/* eslint-disable import/no-extraneous-dependencies */
/* eslint-env node */

const preserveDirectives = require('rollup-plugin-preserve-directives').default;

/**
 * @type {import('dts-cli').DtsOptions}
 */
module.exports = {
  rollup(config) {
    // 'use client' support
    // TODO: Maybe only do this for the react-server builds?
    config.output.preserveModules = true;
    config.plugins.push(preserveDirectives());
    config.onwarn = function onwarn(warning, warn) {
      if (warning.code !== 'MODULE_LEVEL_DIRECTIVE') {
        warn(warning);
      }
    };

    // Otherwise rollup will insert code like `require('next/link')`,
    // which will break the RSC render due to usage of `createContext`
    config.treeshake.moduleSideEffects = false;

    return config;
  }
};
