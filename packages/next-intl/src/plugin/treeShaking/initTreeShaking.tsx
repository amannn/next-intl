import startTreeShakingService from '../../tree-shaking/TreeShakingService.js';
import {isDevelopmentOrNextBuild} from '../config.js';
import type {PluginConfig} from '../types.js';
import {once, throwError, warn} from '../utils.js';

const runOnce = once('_NEXT_INTL_TREE_SHAKING');

export default function initTreeShaking(pluginConfig: PluginConfig) {
  if (!pluginConfig.experimental?.treeShaking) {
    return;
  }

  // Avoid running for:
  // - info
  // - start
  // - typegen
  //
  // Doesn't consult Next.js config anyway:
  // - telemetry
  // - lint
  //
  // What remains are:
  // - dev (NODE_ENV=development)
  // - build (NODE_ENV=production)
  const shouldRun = isDevelopmentOrNextBuild;
  if (!shouldRun) return;

  const srcPath = pluginConfig.experimental.srcPath;
  if (!srcPath) {
    throwError('`experimental.srcPath` is required when using `treeShaking`.');
  }

  runOnce(() => {
    const srcPaths = Array.isArray(srcPath) ? srcPath : [srcPath];
    startTreeShakingService({
      projectRoot: process.cwd(),
      srcPaths
    }).catch((error) => {
      warn(
        `Tree-shaking analyzer failed to start: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    });
  });
}
