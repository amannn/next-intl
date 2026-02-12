import fs from 'fs/promises';
import path from 'path';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import startTreeShakingService from '../../tree-shaking/TreeShakingService.js';
import {getTreeShakingLazyOnlyEnvKey} from '../../tree-shaking/mode.js';
import type {PluginConfig} from '../types.js';
import initTreeShaking from './initTreeShaking.js';

vi.mock('../../tree-shaking/TreeShakingService.js', () => ({
  default: vi.fn(async () => undefined)
}));

vi.mock('../config.js', () => ({
  isDevelopmentOrNextBuild: true
}));

const lazyOnlyEnvKey = getTreeShakingLazyOnlyEnvKey();
const originalLazyOnlyEnv = process.env[lazyOnlyEnvKey];
const originalRunOnceEnv = process.env._NEXT_INTL_TREE_SHAKING;
const originalLazyOnlyWarnOnceEnv =
  process.env._NEXT_INTL_TREE_SHAKING_LAZY_ONLY_WARNED;
const TEMP_DIR_PREFIX = path.join(process.cwd(), '.tmp-init-tree-shaking-');

let projectRoot: string;

function getPluginConfig(): PluginConfig {
  return {
    experimental: {
      srcPath: 'src',
      treeShaking: true
    }
  };
}

beforeEach(async () => {
  vi.clearAllMocks();
  delete process.env[lazyOnlyEnvKey];
  delete process.env._NEXT_INTL_TREE_SHAKING;
  delete process.env._NEXT_INTL_TREE_SHAKING_LAZY_ONLY_WARNED;
  projectRoot = await fs.mkdtemp(TEMP_DIR_PREFIX);
  vi.spyOn(process, 'cwd').mockReturnValue(projectRoot);
});

afterEach(async () => {
  vi.restoreAllMocks();

  if (originalLazyOnlyEnv === undefined) {
    delete process.env[lazyOnlyEnvKey];
  } else {
    process.env[lazyOnlyEnvKey] = originalLazyOnlyEnv;
  }

  if (originalRunOnceEnv === undefined) {
    delete process.env._NEXT_INTL_TREE_SHAKING;
  } else {
    process.env._NEXT_INTL_TREE_SHAKING = originalRunOnceEnv;
  }

  if (originalLazyOnlyWarnOnceEnv === undefined) {
    delete process.env._NEXT_INTL_TREE_SHAKING_LAZY_ONLY_WARNED;
  } else {
    process.env._NEXT_INTL_TREE_SHAKING_LAZY_ONLY_WARNED =
      originalLazyOnlyWarnOnceEnv;
  }

  await fs.rm(projectRoot, {force: true, recursive: true});
});

describe('initTreeShaking', () => {
  it('starts the sidecar service by default', async () => {
    initTreeShaking(getPluginConfig());

    expect(startTreeShakingService).toHaveBeenCalledWith({
      projectRoot,
      srcPaths: ['src']
    });

    await expect(
      fs.stat(
        path.join(
          projectRoot,
          'node_modules',
          '.cache',
          'next-intl',
          'client-manifest.json'
        )
      )
    ).resolves.toBeDefined();
  });

  it('skips sidecar startup in lazy-only mode', async () => {
    process.env[lazyOnlyEnvKey] = '1';
    initTreeShaking(getPluginConfig());

    expect(startTreeShakingService).not.toHaveBeenCalled();
    await expect(
      fs.stat(
        path.join(
          projectRoot,
          'node_modules',
          '.cache',
          'next-intl',
          'client-manifest.json'
        )
      )
    ).resolves.toBeDefined();
  });
});
