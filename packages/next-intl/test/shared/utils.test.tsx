import {it, describe, expect} from 'vitest';
import {
  hasPathnamePrefixed,
  unprefixPathname,
  matchesPathname,
  prefixPathname,
  getSortedPathnames
} from '../../src/shared/utils';

describe('prefixPathname', () => {
  it("doesn't add trailing slashes for the root", () => {
    expect(prefixPathname('/en', '/')).toEqual('/en');
  });

  it("doesn't add trailing slashes for search params", () => {
    expect(prefixPathname('/en', '/?foo=bar')).toEqual('/en?foo=bar');
  });

  it('localizes nested paths', () => {
    expect(prefixPathname('/en', '/nested')).toEqual('/en/nested');
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
    expect(
      matchesPathname('/products/[...slug]', '/products/clothing/t-shirts')
    ).toBe(true);
    expect(matchesPathname('/[[...slug]]', '/products/clothing/t-shirts')).toBe(
      true
    );
    expect(matchesPathname('/products/[[...slug]]', '/products')).toBe(true);
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

describe('getSortedPathnames', () => {
  it('works for static routes that include the root', () => {
    expect(getSortedPathnames(['/', '/foo', '/test'])).toEqual([
      '/',
      '/foo',
      '/test'
    ]);
  });

  it('should prioritize non-catch-all routes over catch-all routes', () => {
    expect(
      getSortedPathnames(['/categories/[...slug]', '/categories/new'])
    ).toEqual(['/categories/new', '/categories/[...slug]']);
  });

  it('should prioritize static routes over optional catch-all routes', () => {
    expect(
      getSortedPathnames(['/categories/[[...slug]]', '/categories'])
    ).toEqual(['/categories', '/categories/[[...slug]]']);
  });

  it('should prioritize more specific routes over dynamic routes', () => {
    expect(
      getSortedPathnames(['/categories/[slug]', '/categories/new'])
    ).toEqual(['/categories/new', '/categories/[slug]']);
  });

  it('should prioritize dynamic routes over catch-all routes', () => {
    expect(
      getSortedPathnames(['/categories/[...slug]', '/categories/[slug]'])
    ).toEqual(['/categories/[slug]', '/categories/[...slug]']);
  });

  it('should prioritize more specific nested routes over dynamic routes', () => {
    expect(
      getSortedPathnames([
        '/articles/[category]/[articleSlug]',
        '/articles/[category]/new'
      ])
    ).toEqual([
      '/articles/[category]/new',
      '/articles/[category]/[articleSlug]'
    ]);
  });

  it('should prioritize more specific nested routes over catch-all routes', () => {
    expect(
      getSortedPathnames([
        '/articles/[category]/[...articleSlug]',
        '/articles/[category]/new'
      ])
    ).toEqual([
      '/articles/[category]/new',
      '/articles/[category]/[...articleSlug]'
    ]);
  });
});
