import {describe, expect, it} from 'vitest';
import {
  compileLocalizedPathname,
  getBasePath,
  serializeSearchParams
} from './utils.tsx';

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
  type Locales = ['en', 'de'];
  const pathnames = {
    '/about/[param]': {
      en: '/about/[param]',
      de: '/ueber-uns/[param]'
    },
    '/test/[one]/[two]': '/test/[one]/[two]',
    '/test/[one]/[one]': '/test/[one]/[one]',
    '/test/[...params]': '/test/[...params]',
    '/test/[[...params]]': '/test/[[...params]]'
  } as const;

  it('compiles a pathname that differs by locale', () => {
    expect(
      compileLocalizedPathname<Locales, '/about/[param]'>({
        locale: 'en',
        pathname: '/about/[param]',
        params: {param: 'value'},
        pathnames
      })
    ).toBe('/about/value');
    expect(
      compileLocalizedPathname<Locales, '/about/[param]'>({
        locale: 'de',
        pathname: '/about/[param]',
        params: {param: 'wert'},
        pathnames
      })
    ).toBe('/ueber-uns/wert');
  });

  it('compiles a pathname that is equal for all locales', () => {
    expect(
      compileLocalizedPathname<Locales, '/test/[one]/[two]'>({
        locale: 'en',
        pathname: '/test/[one]/[two]',
        params: {one: '1', two: '2'},
        pathnames
      })
    ).toBe('/test/1/2');
  });

  it('compiles a pathname where a param appears twice', () => {
    expect(
      compileLocalizedPathname<Locales, '/test/[one]/[one]'>({
        locale: 'en',
        pathname: '/test/[one]/[one]',
        params: {one: '1'},
        pathnames
      })
    ).toBe('/test/1/1');
  });

  it('compiles a pathname with a catch-all segment', () => {
    expect(
      compileLocalizedPathname<Locales, '/test/[...params]'>({
        locale: 'en',
        pathname: '/test/[...params]',
        params: {params: ['a', 'b']},
        pathnames
      })
    ).toBe('/test/a/b');
  });

  it('compiles a pathname with an optional catch-all segment if the segment is provided', () => {
    expect(
      compileLocalizedPathname<Locales, '/test/[[...params]]'>({
        locale: 'en',
        pathname: '/test/[[...params]]',
        params: {params: ['a', 'b']},
        pathnames
      })
    ).toBe('/test/a/b');
  });

  it('compiles a pathname with an optional catch-all segment if the segment is absent', () => {
    expect(
      compileLocalizedPathname<Locales, '/test/[[...params]]'>({
        locale: 'en',
        pathname: '/test/[[...params]]',
        pathnames
      })
    ).toBe('/test');
  });

  it('throws when params were not resolved', () => {
    expect(() =>
      compileLocalizedPathname<Locales, '/test/[one]/[two]'>({
        locale: 'en',
        pathname: '/test/[one]/[two]',
        pathnames,
        // @ts-expect-error -- Purposefully miss a param
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
