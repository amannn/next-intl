import fs from 'fs/promises';
import path from 'path';
import {
  createEmptyManifest,
  writeManifest
} from '../../tree-shaking/Manifest.js';
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

  // Seed empty manifest so alias resolves before first loader run
  const projectRoot = process.cwd();
  const manifestPath = path.join(
    projectRoot,
    'node_modules',
    '.cache',
    'next-intl',
    'client-manifest.json'
  );

  fs.mkdir(path.dirname(manifestPath), {recursive: true})
    .then(() => writeManifest(createEmptyManifest(), projectRoot))
    .catch(() => {
      // Ignore - loader will create on first run
    });
}
