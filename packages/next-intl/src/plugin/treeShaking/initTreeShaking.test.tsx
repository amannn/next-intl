import {afterAll, beforeEach, describe, expect, it, vi} from 'vitest';
import type {PluginConfig} from '../types.js';

const originalNodeEnv = process.env.NODE_ENV;
const originalArgv = [...process.argv];
const startTreeShakingService = vi.fn();

function getPluginConfig(srcPath: string | Array<string> = './src'): PluginConfig {
  return {
    experimental: {
      srcPath,
      treeShaking: true
    }
  };
}

async function importInitTreeShaking() {
  vi.doMock('../../tree-shaking/TreeShakingService.js', () => ({
    default: startTreeShakingService
  }));

  return (await import('./initTreeShaking.js')).default;
}

describe('initTreeShaking', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete process.env._NEXT_INTL_TREE_SHAKING;
    process.env.NODE_ENV = 'production';
    process.argv = ['node', 'next'];
    startTreeShakingService.mockResolvedValue(undefined);
  });

  afterAll(() => {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
    process.argv = originalArgv;
  });

  it('runs in development', async () => {
    process.env.NODE_ENV = 'development';

    const initTreeShaking = await importInitTreeShaking();
    initTreeShaking(getPluginConfig());

    expect(startTreeShakingService).toHaveBeenCalledTimes(1);
    expect(startTreeShakingService).toHaveBeenCalledWith({
      projectRoot: process.cwd(),
      srcPaths: ['./src']
    });
  });

  it('runs for next build', async () => {
    process.argv = ['node', 'next', 'build'];

    const initTreeShaking = await importInitTreeShaking();
    initTreeShaking(getPluginConfig(['./src', './packages']));

    expect(startTreeShakingService).toHaveBeenCalledTimes(1);
    expect(startTreeShakingService).toHaveBeenCalledWith({
      projectRoot: process.cwd(),
      srcPaths: ['./src', './packages']
    });
  });

  it('does not run for other commands', async () => {
    process.argv = ['node', 'next', 'start'];

    const initTreeShaking = await importInitTreeShaking();
    initTreeShaking(getPluginConfig());

    expect(startTreeShakingService).not.toHaveBeenCalled();
  });

  it('skips srcPath validation when service is not running', async () => {
    process.argv = ['node', 'next', 'start'];

    const initTreeShaking = await importInitTreeShaking();

    expect(() =>
      initTreeShaking({
        experimental: {
          treeShaking: true
        }
      } as PluginConfig)
    ).not.toThrow();
    expect(startTreeShakingService).not.toHaveBeenCalled();
  });
});
