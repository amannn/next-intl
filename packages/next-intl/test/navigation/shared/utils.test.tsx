import {describe, expect, it} from 'vitest';
import {
  compileLocalizedPathname,
  getBasePath,
  serializeSearchParams,
  hasPathnamePrefixed,
  unprefixPathname
} from '../../../src/navigation/shared/utils';

describe('serializeSearchParams', () => {
  it('handles strings', () => {
    expect(serializeSearchParams({v: 'test'})).toEqual('?v=test');
  });

  it('handles numbers', () => {
    expect(serializeSearchParams({v: 2})).toEqual('?v=2');
  });

  it('handles booleans', () => {
    expect(serializeSearchParams({v: true})).toEqual('?v=true');
  });

  it('handles arrays', () => {
    expect(serializeSearchParams({v: ['a', 'b']})).toEqual('?v=a&v=b');
  });
});

describe('compileLocalizedPathname', () => {
  it('throws when params were not resolved', () => {
    const locales: ReadonlyArray<string> = ['en'];
    expect(() =>
      // @ts-expect-error -- Purposefully miss a param
      compileLocalizedPathname<typeof locales, '/test/[one]/[two]'>({
        locale: 'en',
        pathname: '/test/[one]/[two]',
        pathnames: '/test/[one]/[two]',
        params: {one: '1'}
      })
    ).toThrow(
      [
        'Insufficient params provided for localized pathname.',
        'Template: /test/[one]/[two]',
        'Params: {"one":"1"}'
      ].join('\n')
    );
  });
});

describe('getBasePath', () => {
  it('detects a base path when using a locale prefix and the user is at the root', () => {
    expect(getBasePath('/en', '/base/en')).toBe('/base');
  });

  it('detects a base path when using a locale prefix and the user is at a nested path', () => {
    expect(getBasePath('/en/about', '/base/en/about')).toBe('/base');
  });

  it('detects a base path when using no locale prefix and the user is at the root', () => {
    expect(getBasePath('/', '/base')).toBe('/base');
  });

  it('detects a base path when using no locale prefix and the user is at a nested path', () => {
    expect(getBasePath('/about', '/base/about')).toBe('/base');
  });
});

describe('hasPathnamePrefixed', () => {
  it('detects prefixed pathnames', () => {
    expect(hasPathnamePrefixed('/en', '/en')).toEqual(true);
    expect(hasPathnamePrefixed('/en', '/en/')).toEqual(true);
    expect(hasPathnamePrefixed('/en', '/en/client')).toEqual(true);
    expect(hasPathnamePrefixed('/en', '/en/client/')).toEqual(true);
    expect(hasPathnamePrefixed('/en', '/en/client/test')).toEqual(true);
  });

  it('detects non-prefixed pathnames', () => {
    expect(hasPathnamePrefixed('/en', '/')).toEqual(false);
    expect(hasPathnamePrefixed('/en', '/client')).toEqual(false);
    expect(hasPathnamePrefixed('/en', '/client/')).toEqual(false);
    expect(hasPathnamePrefixed('/en', '/client/test')).toEqual(false);
  });
});

describe('unlocalizePathname', () => {
  it('works for the root', () => {
    expect(unprefixPathname('/en', '/en')).toEqual('/');
  });

  it('works for nested pages', () => {
    expect(unprefixPathname('/en/nested', '/en')).toEqual('/nested');
  });

  it('works with sub-tags', () => {
    expect(unprefixPathname('/en-GB/nested', '/en-GB')).toEqual('/nested');
  });

  it('works for custom prefixes', () => {
    expect(unprefixPathname('/uk/nested', '/uk')).toEqual('/nested');
  });
});
