import {isDevelopmentOrNextBuild} from '../config.js';
import type {PluginConfig} from '../types.js';
import {throwError} from '../utils.js';

export default function initTreeShaking(pluginConfig: PluginConfig) {
  if (!pluginConfig.experimental?.treeShaking) {
    return;
  }

  const shouldRun = isDevelopmentOrNextBuild;
  if (!shouldRun) return;

  const srcPath = pluginConfig.experimental.srcPath;
  if (!srcPath) {
    throwError('`experimental.srcPath` is required when using `treeShaking`.');
  }
}
