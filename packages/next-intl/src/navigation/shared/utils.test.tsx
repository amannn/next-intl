import {afterEach, describe, expect, it} from 'vitest';
import {
  compileLocalizedPathname,
  getBasePath,
  serializeSearchParams
} from './utils.js';

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

  it('handles empty objects', () => {
    expect(serializeSearchParams({})).toEqual('');
  });

  it('handles URLSearchParams', () => {
    expect(
      serializeSearchParams(new URLSearchParams('v=test&foo=bar'))
    ).toEqual('?v=test&foo=bar');
    expect(serializeSearchParams(new URLSearchParams())).toEqual('');
  });

  it('handles search strings', () => {
    expect(serializeSearchParams('?v=test')).toEqual('?v=test');
    expect(serializeSearchParams('v=test')).toEqual('?v=test');
    expect(serializeSearchParams('')).toEqual('');
    expect(serializeSearchParams('?')).toEqual('');
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

  it('keeps `$` patterns in param values literally', () => {
    expect(
      compileLocalizedPathname<Locales, '/about/[param]'>({
        locale: 'en',
        pathname: '/about/[param]',
        params: {param: 'a$&b'},
        pathnames
      })
    ).toBe('/about/a$&b');

    expect(
      compileLocalizedPathname<Locales, '/about/[param]'>({
        locale: 'en',
        pathname: '/about/[param]',
        params: {param: "$'`$1"},
        pathnames
      })
      // Note: `` ` `` is percent-encoded by URL normalization
    ).toBe("/about/$'%60$1");
  });

  it('keeps `$` patterns in catch-all param values literally', () => {
    expect(
      compileLocalizedPathname<Locales, '/test/[...params]'>({
        locale: 'en',
        pathname: '/test/[...params]',
        params: {params: ['a$&b', 'c']},
        pathnames
      })
    ).toBe('/test/a$&b/c');
  });

  it('handles query as an object', () => {
    expect(
      compileLocalizedPathname<Locales, '/test/[one]/[two]'>({
        locale: 'en',
        pathname: '/test/[one]/[two]',
        params: {one: '1', two: '2'},
        pathnames,
        query: {foo: 'bar'}
      })
    ).toBe('/test/1/2?foo=bar');
  });

  it('handles query as URLSearchParams', () => {
    expect(
      compileLocalizedPathname<Locales, '/test/[one]/[two]'>({
        locale: 'en',
        pathname: '/test/[one]/[two]',
        params: {one: '1', two: '2'},
        pathnames,
        query: new URLSearchParams('foo=bar')
      })
    ).toBe('/test/1/2?foo=bar');
  });

  it('handles query as a string', () => {
    expect(
      compileLocalizedPathname<Locales, '/test/[one]/[two]'>({
        locale: 'en',
        pathname: '/test/[one]/[two]',
        params: {one: '1', two: '2'},
        pathnames,
        query: '?foo=bar'
      })
    ).toBe('/test/1/2?foo=bar');
  });

  it('handles search string', () => {
    expect(
      compileLocalizedPathname<Locales, '/test/[one]/[two]'>({
        locale: 'en',
        pathname: '/test/[one]/[two]',
        params: {one: '1', two: '2'},
        pathnames,
        search: '?foo=bar'
      })
    ).toBe('/test/1/2?foo=bar');

    expect(
      compileLocalizedPathname<Locales, '/test/[one]/[two]'>({
        locale: 'en',
        pathname: '/test/[one]/[two]',
        params: {one: '1', two: '2'},
        pathnames,
        search: 'foo=bar'
      })
    ).toBe('/test/1/2?foo=bar');
  });

  it('omits query or search when empty', () => {
    expect(
      compileLocalizedPathname<Locales, '/test/[one]/[two]'>({
        locale: 'en',
        pathname: '/test/[one]/[two]',
        params: {one: '1', two: '2'},
        pathnames,
        query: {}
      })
    ).toBe('/test/1/2');

    expect(
      compileLocalizedPathname<Locales, '/test/[one]/[two]'>({
        locale: 'en',
        pathname: '/test/[one]/[two]',
        params: {one: '1', two: '2'},
        pathnames,
        search: ''
      })
    ).toBe('/test/1/2');
  });
});

describe('getBasePath', () => {
  afterEach(() => {
    delete process.env._next_intl_base_path;
  });

  it('returns a base path that was provided by the plugin', () => {
    process.env._next_intl_base_path = '/base';
    expect(getBasePath()).toBe('/base');
  });

  it('returns an empty string when no base path is configured', () => {
    expect(getBasePath()).toBe('');
  });
});
