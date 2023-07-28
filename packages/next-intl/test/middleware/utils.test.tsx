import {describe, expect, it} from 'vitest';
import {
  formatPathname,
  getRouteParams,
  matchesPathname
} from '../../src/middleware/utils';

describe('matchesPathname', () => {
  it('returns true for matching paths', () => {
    expect(
      matchesPathname('/users/[userId]-[userName]', '/users/23-jane')
    ).toBe(true);
    expect(
      matchesPathname(
        '/users/[userId]-[userName]-hello',
        '/users/23-jane-smith-hello'
      )
    ).toBe(true);
    expect(matchesPathname('/users/[userId]', '/users/23')).toBe(true);
    expect(
      matchesPathname('/users/[userId]/posts/[postId]', '/users/23/posts/42')
    ).toBe(true);
  });

  it('returns false for non-matching paths', () => {
    expect(matchesPathname('/users/[userId]-[userName]', '/users/23')).toBe(
      false
    );
    expect(matchesPathname('/users/[userId]', '/users/23/posts')).toBe(false);
    expect(
      matchesPathname('/users/[userId]/posts/[postId]', '/users/23/posts')
    ).toBe(false);
  });

  it('returns false for paths with missing parameters', () => {
    expect(matchesPathname('/users/[userId]-[userName]', '/users/')).toBe(
      false
    );
    expect(matchesPathname('/users/[userId]', '/users/')).toBe(false);
    expect(
      matchesPathname('/users/[userId]/posts/[postId]', '/users/23/posts/')
    ).toBe(false);
  });

  it('returns false for paths with extra segments', () => {
    expect(
      matchesPathname('/users/[userId]-[userName]', '/users/23-jane/posts')
    ).toBe(false);
    expect(matchesPathname('/users/[userId]', '/users/23/posts/42')).toBe(
      false
    );
    expect(
      matchesPathname(
        '/users/[userId]/posts/[postId]',
        '/users/23/posts/42/comments'
      )
    ).toBe(false);
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

  it.only('returns an object with parameters for matching paths', () => {
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

  it('handles special characters in parameter values', () => {
    expect(formatPathname('/users/[userId]', {userId: '23 jane'})).toBe(
      '/users/23%20jane'
    );
    expect(formatPathname('/users/[userId]', {userId: '23/42'})).toBe(
      '/users/23%2F42'
    );
  });
});
