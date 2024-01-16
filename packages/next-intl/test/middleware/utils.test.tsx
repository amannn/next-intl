import {describe, expect, it} from 'vitest';
import {
  formatPathname,
  getNormalizedPathname,
  getRouteParams
} from '../../src/middleware/utils';

describe('getNormalizedPathname', () => {
  it('should return the normalized pathname', () => {
    expect(getNormalizedPathname('/en/about', ['en', 'de'])).toBe('/about');
    expect(getNormalizedPathname('/en/energy', ['en', 'de'])).toBe('/energy');
    expect(getNormalizedPathname('/energy', ['en'])).toBe('/energy');
    expect(getNormalizedPathname('/de/about', ['en', 'de'])).toBe('/about');
    expect(getNormalizedPathname('/about', ['en', 'de'])).toBe('/about');
    expect(getNormalizedPathname('/', ['en', 'de'])).toBe('/');
    expect(getNormalizedPathname('/es', ['en', 'de'])).toBe('/es');
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
    expect(formatPathname('/users')).toBe('/users');
    expect(formatPathname('/users/[userId]-[userName]')).toBe(
      '/users/[userId]-[userName]'
    );
    expect(formatPathname('/users/[userId]/posts/[postId]')).toBe(
      '/users/[userId]/posts/[postId]'
    );
  });

  it('replaces parameter placeholders with values', () => {
    expect(
      formatPathname('/users/[userId]-[userName]', {
        userId: '23',
        userName: 'jane'
      })
    ).toBe('/users/23-jane');
    expect(formatPathname('/users/[userId]', {userId: '23'})).toBe('/users/23');
    expect(
      formatPathname('/users/[userId]/posts/[postId]', {
        userId: '23',
        postId: '42'
      })
    ).toBe('/users/23/posts/42');
  });

  it('ignores extra parameters', () => {
    expect(
      formatPathname('/users/[userId]-[userName]', {
        userId: '23',
        userName: 'jane',
        extra: 'param'
      })
    ).toBe('/users/23-jane');
    expect(
      formatPathname('/users/[userId]', {userId: '23', extra: 'param'})
    ).toBe('/users/23');
    expect(
      formatPathname('/users/[userId]/posts/[postId]', {
        userId: '23',
        postId: '42',
        extra: 'param'
      })
    ).toBe('/users/23/posts/42');
  });

  it('does not encode special characters in parameter values', () => {
    expect(formatPathname('/users/[userId]', {userId: '23%20jane'})).toBe(
      '/users/23%20jane'
    );
    expect(formatPathname('/users/[userId]', {userId: '23/42'})).toBe(
      '/users/23/42'
    );
  });
});
