import {isDeepStrictEqual} from 'util';
import type {NextConfig} from 'next';
import {describe, expect, it} from 'vitest';
import normalizeExtractorConfig from '../extractor/normalizeExtractorConfig.js';
import SourceFileFilter from '../extractor/source/SourceFileFilter.js';
import getNextConfig from './getNextConfig.js';
import type {PluginConfig} from './types.js';

function getLoaderOptions(config: NextConfig, glob: string) {
  const rule = config.turbopack?.rules?.[glob];
  if (!rule || Array.isArray(rule) || !('loaders' in rule)) {
    throw new Error(`Expected a loader rule for ${glob}`);
  }
  const loader = rule.loaders?.[0];
  if (!loader || typeof loader === 'string') {
    throw new Error(`Expected loader options for ${glob}`);
  }
  return loader.options;
}

function getCatalogLoaderOptions(pluginConfig: PluginConfig) {
  return getLoaderOptions(
    getNextConfig({requestConfig: './i18n/request.tsx', ...pluginConfig}),
    '*.json'
  );
}

/**
 * Turbopack rejects loader options that don't survive a JSON round-trip.
 * https://github.com/amannn/next-intl/issues/2394
 */
function isSerializableForTurbopack(options: unknown) {
  return isDeepStrictEqual(options, JSON.parse(JSON.stringify(options)));
}

describe('catalog loader options', () => {
  const messages = {
    path: './messages',
    format: 'json',
    locales: 'infer'
  } as const;

  it('omits an absent source locale', () => {
    const options = getCatalogLoaderOptions({experimental: {messages}});
    expect(options).toEqual({messages: {format: 'json'}});
    expect(isSerializableForTurbopack(options)).toBe(true);
  });

  it('includes a configured source locale', () => {
    const options = getCatalogLoaderOptions({
      experimental: {messages: {...messages, sourceLocale: 'en'}}
    });
    expect(options).toEqual({messages: {format: 'json', sourceLocale: 'en'}});
    expect(isSerializableForTurbopack(options)).toBe(true);
  });

  it('falls back to the deprecated source locale of `extract`', () => {
    const options = getCatalogLoaderOptions({
      experimental: {
        messages,
        extract: {sourceLocale: 'en'},
        srcPath: './src'
      }
    });
    expect(options).toEqual({messages: {format: 'json', sourceLocale: 'en'}});
    expect(isSerializableForTurbopack(options)).toBe(true);
  });

  it('includes `precompile` when it is configured', () => {
    const options = getCatalogLoaderOptions({
      experimental: {messages: {...messages, precompile: false}}
    });
    expect(options).toEqual({messages: {format: 'json', precompile: false}});
    expect(isSerializableForTurbopack(options)).toBe(true);
  });
});

describe('extraction loader options', () => {
  it('provides serializable options', () => {
    const pluginConfig = {
      requestConfig: './i18n/request.tsx',
      experimental: {
        messages: {path: './messages', format: 'json', locales: 'infer'},
        extract: true,
        srcPath: './src'
      }
    } satisfies PluginConfig;
    const extractorConfig = normalizeExtractorConfig({
      ...pluginConfig.experimental,
      messages: {...pluginConfig.experimental.messages, sourceLocale: 'en'}
    });

    const options = getLoaderOptions(
      getNextConfig(pluginConfig, undefined, extractorConfig),
      `*.{${SourceFileFilter.EXTENSIONS.join(',')}}`
    );
    expect(isSerializableForTurbopack(options)).toBe(true);
  });
});
