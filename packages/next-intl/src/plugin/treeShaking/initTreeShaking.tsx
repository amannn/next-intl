import fs from 'fs';
import path from 'path';
import startTreeShakingService from '../../tree-shaking/TreeShakingService.js';
import {
  getTreeShakingLazyOnlyEnvKey,
  isTreeShakingLazyOnly
} from '../../tree-shaking/mode.js';
import {isDevelopmentOrNextBuild} from '../config.js';
import type {PluginConfig} from '../types.js';
import {once, throwError, warn} from '../utils.js';

const MANIFEST_CONTENT = '{}';
const MANIFEST_RELATIVE_PATH = path.join(
  'node_modules',
  '.cache',
  'next-intl',
  'client-manifest.json'
);
const runOnce = once('_NEXT_INTL_TREE_SHAKING');
const warnLazyOnlyOnce = once('_NEXT_INTL_TREE_SHAKING_LAZY_ONLY_WARNED');

function ensureManifestFileExists(projectRoot: string) {
  const manifestPath = path.join(projectRoot, MANIFEST_RELATIVE_PATH);
  if (fs.existsSync(manifestPath)) {
    return;
  }

  fs.mkdirSync(path.dirname(manifestPath), {recursive: true});
  fs.writeFileSync(manifestPath, MANIFEST_CONTENT, 'utf8');
}

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

  const projectRoot = process.cwd();
  ensureManifestFileExists(projectRoot);

  if (isTreeShakingLazyOnly()) {
    warnLazyOnlyOnce(() => {
      warn(
        `Tree-shaking lazy-only mode enabled via ${getTreeShakingLazyOnlyEnvKey()}=1; skipping sidecar manifest scan.`
      );
    });
    return;
  }

  runOnce(() => {
    const srcPaths = Array.isArray(srcPath) ? srcPath : [srcPath];
    startTreeShakingService({
      projectRoot,
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
