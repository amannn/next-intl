import {describe, expect, it} from 'vitest';
import {
  formatPathnameTemplate,
  getInternalTemplate,
  getNormalizedPathname,
  getRouteParams
} from './utils';

describe('getNormalizedPathname', () => {
  it('should return the normalized pathname', () => {
    function getResult(pathname: string) {
      return getNormalizedPathname(pathname, ['en', 'de'], {mode: 'always'});
    }

    expect(getResult('/en/about')).toBe('/about');
    expect(getResult('/en/energy')).toBe('/energy');
    expect(getResult('/energy')).toBe('/energy');
    expect(getResult('/de/about')).toBe('/about');
    expect(getResult('/about')).toBe('/about');
    expect(getResult('/')).toBe('/');
    expect(getResult('/es')).toBe('/es');
  });
});

describe('getRouteParams', () => {
  it('returns undefined for non-matching paths', () => {
    expect(
      getRouteParams('/users/[userId]-[userName]', '/posts/42')
    ).toBeUndefined();
    expect(getRouteParams('/users/[userId]', '/posts/42')).toBeUndefined();
    expect(
      getRouteParams('/users/[userId]/posts/[postId]', '/users/23/comments/42')
    ).toBeUndefined();
  });

  it('returns an object with parameters for matching paths', () => {
    expect(
      getRouteParams('/users/[userId]-[userName]', '/users/23-jane')
    ).toEqual({userId: '23', userName: 'jane'});
    expect(getRouteParams('/users/[userId]', '/users/23')).toEqual({
      userId: '23'
    });
    expect(
      getRouteParams('/users/[userId]/posts/[postId]', '/users/23/posts/42')
    ).toEqual({userId: '23', postId: '42'});
  });

  it('handles special characters in parameter values', () => {
    expect(getRouteParams('/users/[userId]', '/users/23%20jane')).toEqual({
      userId: '23%20jane'
    });
    expect(getRouteParams('/users/[userId]', '/users/23%2F42')).toEqual({
      userId: '23%2F42'
    });
  });

  it('handles arrays', () => {
    expect(
      getRouteParams(
        '/categories/[...categories]',
        '/categories/clothing/t-shirts'
      )
    ).toEqual({
      '...categories': 'clothing/t-shirts'
    });
    expect(
      getRouteParams(
        '/categories/[[...categories]]',
        '/categories/clothing/t-shirts'
      )
    ).toEqual({
      '...categories': 'clothing/t-shirts'
    });
  });
});

describe('formatPathname', () => {
  it('returns the template if no params are provided', () => {
    expect(formatPathnameTemplate('/users')).toBe('/users');
    expect(formatPathnameTemplate('/users/[userId]-[userName]')).toBe(
      '/users/[userId]-[userName]'
    );
    expect(formatPathnameTemplate('/users/[userId]/posts/[postId]')).toBe(
      '/users/[userId]/posts/[postId]'
    );
  });

  it('replaces parameter placeholders with values', () => {
    expect(
      formatPathnameTemplate('/users/[userId]-[userName]', {
        userId: '23',
        userName: 'jane'
      })
    ).toBe('/users/23-jane');
    expect(formatPathnameTemplate('/users/[userId]', {userId: '23'})).toBe(
      '/users/23'
    );
    expect(
      formatPathnameTemplate('/users/[userId]/posts/[postId]', {
        userId: '23',
        postId: '42'
      })
    ).toBe('/users/23/posts/42');
  });

  it('ignores extra parameters', () => {
    expect(
      formatPathnameTemplate('/users/[userId]-[userName]', {
        userId: '23',
        userName: 'jane',
        extra: 'param'
      })
    ).toBe('/users/23-jane');
    expect(
      formatPathnameTemplate('/users/[userId]', {userId: '23', extra: 'param'})
    ).toBe('/users/23');
    expect(
      formatPathnameTemplate('/users/[userId]/posts/[postId]', {
        userId: '23',
        postId: '42',
        extra: 'param'
      })
    ).toBe('/users/23/posts/42');
  });

  it('does not encode special characters in parameter values', () => {
    expect(
      formatPathnameTemplate('/users/[userId]', {userId: '23%20jane'})
    ).toBe('/users/23%20jane');
    expect(formatPathnameTemplate('/users/[userId]', {userId: '23/42'})).toBe(
      '/users/23/42'
    );
  });
});

describe('getInternalTemplate', () => {
  const pathnames = {
    '/categories/[[...slug]]': {
      en: '/categories/[[...slug]]',
      de: '/kategorien/[[...slug]]',
      it: '/categorie/[[...slug]]'
    },
    '/internal/[id]': {
      en: '/external-en/[id]',
      de: '/external/[id]',
      it: '/external/[id]'
    }
  };

  it('works when passing no params to optional catch-all segments', () => {
    expect(getInternalTemplate(pathnames, '/kategorien', 'en')).toEqual([
      'de',
      '/categories/[[...slug]]'
    ]);
  });

  it('works when passing params to optional catch-all segments', () => {
    expect(getInternalTemplate(pathnames, '/kategorien/neu', 'en')).toEqual([
      'de',
      '/categories/[[...slug]]'
    ]);
  });

  it('prefers a template from the current locale', () => {
    expect(getInternalTemplate(pathnames, '/external/2', 'it')).toEqual([
      'it',
      '/internal/[id]'
    ]);
  });
});
