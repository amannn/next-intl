import path from 'path';
import {describe, expect, it} from 'vitest';
import Codec from './Codec.js';
import resolveCodec from './resolveCodec.js';

describe('resolveCodec', () => {
  it('resolves json codec', async () => {
    const codec = await resolveCodec('json', '/project');
    expect(codec).toBeInstanceOf(Codec);
    expect(codec.EXTENSION).toBe('.json');
  });

  it('resolves po codec', async () => {
    const codec = await resolveCodec('po', '/project');
    expect(codec).toBeInstanceOf(Codec);
    expect(codec.EXTENSION).toBe('.po');
  });

  it('throws for non-existent custom codec file', async () => {
    await expect(
      resolveCodec('./non-existent-codec.js', '/project')
    ).rejects.toThrow(
      '[next-intl] Could not load custom codec from "/project/non-existent-codec.js"'
    );
  });

  it('resolves custom codec from absolute path', async () => {
    const customCodecPath = path.resolve(
      __dirname,
      '__fixtures__/CustomCodec.js'
    );

    const codec = await resolveCodec(customCodecPath, '/project');
    expect(codec).toBeInstanceOf(Codec);
    expect(codec.EXTENSION).toBe('.custom');
  });

  it('resolves custom codec from relative path', async () => {
    // Using relative path from project root
    const fixturesDir = path.resolve(__dirname, '__fixtures__');
    const codec = await resolveCodec('./CustomCodec.js', fixturesDir);
    expect(codec).toBeInstanceOf(Codec);
    expect(codec.EXTENSION).toBe('.custom');
  });

  it('throws for custom codec without default export', async () => {
    const invalidCodecPath = path.resolve(
      __dirname,
      '__fixtures__/InvalidCodecNoDefault.js'
    );

    await expect(resolveCodec(invalidCodecPath, '/project')).rejects.toThrow(
      'must export a default class'
    );
  });

  it('throws for custom codec that does not extend Codec', async () => {
    const invalidCodecPath = path.resolve(
      __dirname,
      '__fixtures__/InvalidCodecNotExtending.js'
    );

    await expect(resolveCodec(invalidCodecPath, '/project')).rejects.toThrow(
      'must extend the Codec base class'
    );
  });
});
