// @vitest-environment edge-runtime

import {RequestCookies} from 'next/dist/compiled/@edge-runtime/cookies';
import {NextRequest, NextResponse} from 'next/server';
import {it, describe, vi, beforeEach, expect, Mock} from 'vitest';
import createIntlMiddleware from '../../src/middleware';
import {COOKIE_LOCALE_NAME} from '../../src/shared/constants';

vi.mock('next/server', () => {
  type MiddlewareResponseInit = Parameters<(typeof NextResponse)['next']>[0];

  function createResponse(init: MiddlewareResponseInit) {
    const response = new Response(null, init);
    (response as any).cookies = new RequestCookies(
      init?.request?.headers || new Headers()
    );
    return response as NextResponse;
  }
  return {
    NextResponse: {
      next: vi.fn((init: ResponseInit) => createResponse(init)),
      rewrite: vi.fn((_destination: string, init: ResponseInit) =>
        createResponse(init)
      ),
      redirect: vi.fn((_url: string, init: ResponseInit) =>
        createResponse(init)
      )
    }
  };
});

function createMockRequest(
  pathnameWithSearch = '/',
  locale = 'en',
  host = 'http://localhost:3000',
  localeCookieValue?: string,
  customHeaders?: HeadersInit
) {
  const headers = new Headers({
    'accept-language': `${locale};q=0.9,en;q=0.8`,
    host: new URL(host).host,
    ...(localeCookieValue && {
      cookie: `${COOKIE_LOCALE_NAME}=${localeCookieValue}`
    }),
    ...customHeaders
  });
  const url = host + pathnameWithSearch;

  return {
    headers,
    cookies: new RequestCookies(headers),
    url,
    nextUrl: {
      pathname: pathnameWithSearch.replace(/\?.*$/, ''),
      href: url,
      search: pathnameWithSearch.includes('?')
        ? '?' + pathnameWithSearch.split('?')[1]
        : ''
    }
  } as NextRequest;
}

const MockedNextResponse = NextResponse as unknown as {
  next: Mock<Parameters<(typeof NextResponse)['next']>>;
  rewrite: Mock<Parameters<(typeof NextResponse)['rewrite']>>;
  redirect: Mock<Parameters<(typeof NextResponse)['redirect']>>;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('prefix-based routing', () => {
  describe('localePrefix: as-needed', () => {
    const middleware = createIntlMiddleware({
      defaultLocale: 'en',
      locales: ['en', 'de']
    });

    it('rewrites requests for the default locale', () => {
      middleware(createMockRequest('/'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/en'
      );
    });

    it('rewrites requests for the default locale with query params at the root', () => {
      middleware(createMockRequest('/?sort=asc'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/en?sort=asc'
      );
    });

    it('rewrites requests for the default locale with query params at a nested path', () => {
      middleware(createMockRequest('/list?sort=asc'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/en/list?sort=asc'
      );
    });

    it('handles hashes for the default locale', () => {
      middleware(createMockRequest('/#asdf'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/en/#asdf'
      );
    });

    it('redirects requests for the default locale when prefixed at the root', () => {
      middleware(createMockRequest('/en'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/'
      );
    });

    it('redirects requests for the default locale when prefixed at sub paths', () => {
      middleware(createMockRequest('/en/about'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/about'
      );
    });

    it('redirects requests for other locales', () => {
      middleware(createMockRequest('/', 'de'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/de'
      );
    });

    it('redirects requests for the root if a cookie exists with a non-default locale', () => {
      middleware(createMockRequest('/', 'en', 'http://localhost:3000', 'de'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/de'
      );
    });

    it('serves requests for other locales when prefixed', () => {
      middleware(createMockRequest('/de'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).toHaveBeenCalled();
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/de'
      );
    });

    it('serves requests for other locales when prefixed with a trailing slash', () => {
      middleware(createMockRequest('/de/'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).toHaveBeenCalled();
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/de/'
      );
    });

    it('serves requests for other locales with query params at the root', () => {
      middleware(createMockRequest('/de?sort=asc'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).toHaveBeenCalled();
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/de?sort=asc'
      );
    });

    it('serves requests for other locales with query params at a nested path', () => {
      middleware(createMockRequest('/de/list?sort=asc'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).toHaveBeenCalled();
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/de/list?sort=asc'
      );
    });

    it('sets a cookie', () => {
      const response = middleware(createMockRequest('/'));
      expect(response.cookies.get('NEXT_LOCALE')).toEqual({
        name: 'NEXT_LOCALE',
        value: 'en'
      });
    });

    it('retains request headers for the default locale', () => {
      middleware(
        createMockRequest('/', 'en', 'http://localhost:3000', undefined, {
          'x-test': 'test'
        })
      );
      expect(
        MockedNextResponse.rewrite.mock.calls[0][1]?.request?.headers?.get(
          'x-test'
        )
      ).toBe('test');
    });

    it('retains request headers for secondary locales', () => {
      middleware(
        createMockRequest('/de', 'de', 'http://localhost:3000', undefined, {
          'x-test': 'test'
        })
      );
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).toHaveBeenCalled();
      expect(
        MockedNextResponse.rewrite.mock.calls[0][1]?.request?.headers?.get(
          'x-test'
        )
      ).toBe('test');
    });

    it('returns alternate links', () => {
      const response = middleware(createMockRequest('/'));
      expect(response.headers.get('link')).toBe(
        [
          '<http://localhost:3000/>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/>; rel="alternate"; hreflang="x-default"'
        ].join(', ')
      );
    });

    describe('localized pathnames', () => {
      const middlewareWithPathnames = createIntlMiddleware({
        defaultLocale: 'en',
        locales: ['en', 'de'],
        pathnames: {
          '/': '/',
          '/about': {
            en: '/about',
            de: '/ueber'
          },
          '/users': {
            en: '/users',
            de: '/benutzer'
          },
          '/users/[userId]': {
            en: '/users/[userId]',
            de: '/benutzer/[userId]'
          },
          '/news/[articleSlug]-[articleId]': {
            en: '/news/[articleSlug]-[articleId]',
            de: '/neuigkeiten/[articleSlug]-[articleId]'
          },
          '/products/[...slug]': {
            en: '/products/[...slug]',
            de: '/produkte/[...slug]'
          },
          '/categories/[[...slug]]': {
            en: '/categories/[[...slug]]',
            de: '/kategorien/[[...slug]]'
          }
        }
      });

      it('serves requests for the default locale at the root', () => {
        middlewareWithPathnames(createMockRequest('/', 'en'));
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en'
        );
      });

      it('serves requests for the default locale at nested paths', () => {
        middlewareWithPathnames(createMockRequest('/about', 'en'));
        middlewareWithPathnames(createMockRequest('/users', 'en'));
        middlewareWithPathnames(createMockRequest('/users/1', 'en'));
        middlewareWithPathnames(
          createMockRequest('/news/happy-newyear-g5b116754', 'en')
        );
        middlewareWithPathnames(
          createMockRequest('/products/apparel/t-shirts', 'en')
        );
        middlewareWithPathnames(
          createMockRequest('/categories/women/t-shirts', 'en')
        );

        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalledTimes(6);
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en/about'
        );
        expect(MockedNextResponse.rewrite.mock.calls[1][0].toString()).toBe(
          'http://localhost:3000/en/users'
        );
        expect(MockedNextResponse.rewrite.mock.calls[2][0].toString()).toBe(
          'http://localhost:3000/en/users/1'
        );
        expect(MockedNextResponse.rewrite.mock.calls[3][0].toString()).toBe(
          'http://localhost:3000/en/news/happy-newyear-g5b116754'
        );
        expect(MockedNextResponse.rewrite.mock.calls[4][0].toString()).toBe(
          'http://localhost:3000/en/products/apparel/t-shirts'
        );
        expect(MockedNextResponse.rewrite.mock.calls[5][0].toString()).toBe(
          'http://localhost:3000/en/categories/women/t-shirts'
        );
      });

      it('serves requests for a non-default locale at the root', () => {
        middlewareWithPathnames(createMockRequest('/de', 'de'));
        expect(MockedNextResponse.rewrite).toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled(); // We rewrite just in case
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/de'
        );
      });

      it('serves requests for a non-default locale at nested paths', () => {
        middlewareWithPathnames(createMockRequest('/de/ueber', 'de'));
        middlewareWithPathnames(createMockRequest('/de/benutzer', 'de'));
        middlewareWithPathnames(createMockRequest('/de/benutzer/1', 'de'));
        middlewareWithPathnames(
          createMockRequest('/de/neuigkeiten/happy-newyear-g5b116754', 'de')
        );
        middlewareWithPathnames(
          createMockRequest('/de/produkte/kleidung/t-shirts', 'de')
        );
        middlewareWithPathnames(
          createMockRequest('/de/kategorien/frauen/t-shirts', 'de')
        );

        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalledTimes(6);
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/de/about'
        );
        expect(MockedNextResponse.rewrite.mock.calls[1][0].toString()).toBe(
          'http://localhost:3000/de/users'
        );
        expect(MockedNextResponse.rewrite.mock.calls[2][0].toString()).toBe(
          'http://localhost:3000/de/users/1'
        );
        expect(MockedNextResponse.rewrite.mock.calls[3][0].toString()).toBe(
          'http://localhost:3000/de/news/happy-newyear-g5b116754'
        );
        expect(MockedNextResponse.rewrite.mock.calls[4][0].toString()).toBe(
          'http://localhost:3000/de/products/kleidung/t-shirts'
        );
        expect(MockedNextResponse.rewrite.mock.calls[5][0].toString()).toBe(
          'http://localhost:3000/de/categories/frauen/t-shirts'
        );
      });

      it('redirects a request for a localized route that is not associated with the requested locale', () => {
        middlewareWithPathnames(createMockRequest('/ueber', 'en'));
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/about'
        );
      });

      it('redirects when a pathname from the default locale ends up with a different locale', () => {
        // Relevant to avoid duplicate content issues
        middlewareWithPathnames(createMockRequest('/de/about', 'de'));
        middlewareWithPathnames(createMockRequest('/de/users/2', 'de'));
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(2);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/de/ueber'
        );
        expect(MockedNextResponse.redirect.mock.calls[1][0].toString()).toBe(
          'http://localhost:3000/de/benutzer/2'
        );
      });

      it('redirects a non-prefixed nested path to a localized alternative if another locale was detected', () => {
        middlewareWithPathnames(createMockRequest('/about', 'de'));
        middlewareWithPathnames(createMockRequest('/users/2', 'de'));
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(2);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/de/ueber'
        );
        expect(MockedNextResponse.redirect.mock.calls[1][0].toString()).toBe(
          'http://localhost:3000/de/benutzer/2'
        );
      });

      it('sets alternate links', () => {
        function getLinks(request: NextRequest) {
          return middlewareWithPathnames(request)
            .headers.get('link')
            ?.split(', ');
        }

        expect(getLinks(createMockRequest('/', 'en'))).toEqual([
          '<http://localhost:3000/>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(getLinks(createMockRequest('/de', 'de'))).toEqual([
          '<http://localhost:3000/>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(getLinks(createMockRequest('/about', 'en'))).toEqual([
          '<http://localhost:3000/about>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/ueber>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/about>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(getLinks(createMockRequest('/de/ueber', 'de'))).toEqual([
          '<http://localhost:3000/about>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/ueber>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/about>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(getLinks(createMockRequest('/users/1', 'en'))).toEqual([
          '<http://localhost:3000/users/1>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/benutzer/1>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/users/1>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(getLinks(createMockRequest('/de/benutzer/1', 'de'))).toEqual([
          '<http://localhost:3000/users/1>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/benutzer/1>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/users/1>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(
          getLinks(createMockRequest('/products/apparel/t-shirts', 'en'))
        ).toEqual([
          '<http://localhost:3000/products/apparel/t-shirts>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/produkte/apparel/t-shirts>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/products/apparel/t-shirts>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(
          getLinks(createMockRequest('/de/produkte/apparel/t-shirts', 'de'))
        ).toEqual([
          '<http://localhost:3000/products/apparel/t-shirts>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/produkte/apparel/t-shirts>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/products/apparel/t-shirts>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(getLinks(createMockRequest('/unknown', 'en'))).toEqual([
          '<http://localhost:3000/unknown>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/unknown>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/unknown>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(getLinks(createMockRequest('/de/unknown', 'de'))).toEqual([
          '<http://localhost:3000/unknown>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/unknown>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/unknown>; rel="alternate"; hreflang="x-default"'
        ]);
      });
    });
  });

  describe('localePrefix: as-needed, localeDetection: false', () => {
    const middleware = createIntlMiddleware({
      defaultLocale: 'en',
      locales: ['en', 'de'],
      localePrefix: 'as-needed',
      localeDetection: false
    });

    it('serves non-prefixed requests with the default locale and ignores the accept-language header', () => {
      middleware(createMockRequest('/', 'de'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/en'
      );
    });

    it('serves non-prefixed requests with the default locale and ignores an existing cookie value', () => {
      middleware(createMockRequest('/', 'de', 'http://localhost:3000', 'de'));

      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/en'
      );
    });
  });

  describe('localePrefix: always', () => {
    const middleware = createIntlMiddleware({
      defaultLocale: 'en',
      locales: ['en', 'de'],
      localePrefix: 'always'
    });

    it('redirects non-prefixed requests for the default locale', () => {
      middleware(createMockRequest('/'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/en'
      );
    });

    it('redirects requests for other locales', () => {
      middleware(createMockRequest('/', 'de'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/de'
      );
    });

    it('redirects when a pathname starts with the locale characters', () => {
      middleware(createMockRequest('/engage'));
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/en/engage'
      );

      middleware(createMockRequest('/engage?test'));
      expect(MockedNextResponse.redirect.mock.calls[1][0].toString()).toBe(
        'http://localhost:3000/en/engage?test'
      );

      middleware(createMockRequest('/engage/test'));
      expect(MockedNextResponse.redirect.mock.calls[2][0].toString()).toBe(
        'http://localhost:3000/en/engage/test'
      );
    });

    it('serves requests for the default locale', () => {
      middleware(createMockRequest('/en'));
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).toHaveBeenCalled();
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/en'
      );
    });

    it('serves requests for non-default locales', () => {
      middleware(createMockRequest('/de'));
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).toHaveBeenCalled();
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/de'
      );
    });

    describe('localized pathnames', () => {
      const middlewareWithPathnames = createIntlMiddleware({
        defaultLocale: 'en',
        locales: ['en', 'de'],
        localePrefix: 'always',
        pathnames: {
          '/': '/',
          '/about': {
            en: '/about',
            de: '/ueber'
          },
          '/users': {
            en: '/users',
            de: '/benutzer'
          },
          '/users/[userId]': {
            en: '/users/[userId]',
            de: '/benutzer/[userId]'
          },
          '/news/[articleSlug]-[articleId]': {
            en: '/news/[articleSlug]-[articleId]',
            de: '/neuigkeiten/[articleSlug]-[articleId]'
          },
          '/products/[...slug]': {
            en: '/products/[...slug]',
            de: '/produkte/[...slug]'
          }
        }
      });

      it('serves requests for the default locale at the root', () => {
        middlewareWithPathnames(createMockRequest('/en', 'en'));
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en'
        );
      });

      it('serves requests for the default locale at nested paths', () => {
        middlewareWithPathnames(createMockRequest('/en/about', 'en'));
        middlewareWithPathnames(createMockRequest('/en/users', 'en'));
        middlewareWithPathnames(createMockRequest('/en/users/1', 'en'));
        middlewareWithPathnames(
          createMockRequest('/en/news/happy-newyear-g5b116754', 'en')
        );

        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalledTimes(4);
        expect(
          MockedNextResponse.rewrite.mock.calls.map((call) =>
            call[0].toString()
          )
        ).toEqual([
          'http://localhost:3000/en/about',
          'http://localhost:3000/en/users',
          'http://localhost:3000/en/users/1',
          'http://localhost:3000/en/news/happy-newyear-g5b116754'
        ]);
      });

      it('serves requests for a non-default locale at the root', () => {
        middlewareWithPathnames(createMockRequest('/de', 'de'));
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/de'
        );
      });

      it('serves requests for a non-default locale at nested paths', () => {
        middlewareWithPathnames(createMockRequest('/de/ueber', 'de'));
        middlewareWithPathnames(createMockRequest('/de/benutzer', 'de'));
        middlewareWithPathnames(createMockRequest('/de/benutzer/1', 'de'));
        middlewareWithPathnames(
          createMockRequest('/de/neuigkeiten/gutes-neues-jahr-g5b116754', 'de')
        );

        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/de/about'
        );
        expect(MockedNextResponse.rewrite.mock.calls[1][0].toString()).toBe(
          'http://localhost:3000/de/users'
        );
        expect(MockedNextResponse.rewrite.mock.calls[2][0].toString()).toBe(
          'http://localhost:3000/de/users/1'
        );
        expect(MockedNextResponse.rewrite.mock.calls[3][0].toString()).toBe(
          'http://localhost:3000/de/news/gutes-neues-jahr-g5b116754'
        );
      });

      it('redirects a request for a localized route that is not associated with the requested locale', () => {
        // Relevant to avoid duplicate content issues
        middlewareWithPathnames(createMockRequest('/en/ueber', 'en'));
        middlewareWithPathnames(createMockRequest('/en/benutzer/12', 'en'));
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(2);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en/about'
        );
        expect(MockedNextResponse.redirect.mock.calls[1][0].toString()).toBe(
          'http://localhost:3000/en/users/12'
        );
      });

      it('sets alternate links', () => {
        function getLinks(request: NextRequest) {
          return middlewareWithPathnames(request)
            .headers.get('link')
            ?.split(', ');
        }

        expect(getLinks(createMockRequest('/en', 'en'))).toEqual([
          '<http://localhost:3000/en>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(getLinks(createMockRequest('/de', 'de'))).toEqual([
          '<http://localhost:3000/en>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(getLinks(createMockRequest('/en/about', 'en'))).toEqual([
          '<http://localhost:3000/en/about>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/ueber>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/about>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(getLinks(createMockRequest('/de/ueber', 'de'))).toEqual([
          '<http://localhost:3000/en/about>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/ueber>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/about>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(getLinks(createMockRequest('/en/users/1', 'en'))).toEqual([
          '<http://localhost:3000/en/users/1>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/benutzer/1>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/users/1>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(getLinks(createMockRequest('/de/benutzer/1', 'de'))).toEqual([
          '<http://localhost:3000/en/users/1>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/benutzer/1>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/users/1>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(
          getLinks(createMockRequest('/en/products/apparel/t-shirts', 'en'))
        ).toEqual([
          '<http://localhost:3000/en/products/apparel/t-shirts>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/produkte/apparel/t-shirts>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/products/apparel/t-shirts>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(
          getLinks(createMockRequest('/de/produkte/apparel/t-shirts', 'de'))
        ).toEqual([
          '<http://localhost:3000/en/products/apparel/t-shirts>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/produkte/apparel/t-shirts>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/products/apparel/t-shirts>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(getLinks(createMockRequest('/en/unknown', 'en'))).toEqual([
          '<http://localhost:3000/en/unknown>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/unknown>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/unknown>; rel="alternate"; hreflang="x-default"'
        ]);
      });
    });
  });

  describe('localePrefix: never', () => {
    const middleware = createIntlMiddleware({
      defaultLocale: 'en',
      locales: ['en', 'de'],
      localePrefix: 'never'
    });

    it('rewrites requests for the default locale', () => {
      middleware(createMockRequest('/'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/en'
      );
    });

    it('rewrites requests for other locales', () => {
      middleware(createMockRequest('/', 'de'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/de'
      );
    });

    it('rewrites requests for the default locale at a nested path', () => {
      middleware(createMockRequest('/list'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/en/list'
      );
    });

    it('rewrites requests for other locales at a nested path', () => {
      middleware(createMockRequest('/list', 'de'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/de/list'
      );
    });

    it('redirects requests with default locale in the path', () => {
      middleware(createMockRequest('/en'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/'
      );
    });

    it('redirects requests with other locales in the path', () => {
      middleware(createMockRequest('/de', 'de'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/'
      );
    });

    it('redirects requests with default locale in a nested path', () => {
      middleware(createMockRequest('/en/list'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/list'
      );
    });

    it('rewrites requests for the root if a cookie exists with a non-default locale', () => {
      middleware(createMockRequest('/', 'en', 'http://localhost:3000', 'de'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/de'
      );
    });

    it('rewrites requests for the root if a cookie exists with the default locale', () => {
      middleware(createMockRequest('/', 'de', 'http://localhost:3000', 'en'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/en'
      );
    });

    it('sets a cookie', () => {
      const response = middleware(createMockRequest('/'));
      expect(response.cookies.get('NEXT_LOCALE')).toEqual({
        name: 'NEXT_LOCALE',
        value: 'en'
      });
    });

    it('sets a cookie based on accept-language header', () => {
      const response = middleware(createMockRequest('/', 'de'));
      expect(response.cookies.get('NEXT_LOCALE')).toEqual({
        name: 'NEXT_LOCALE',
        value: 'de'
      });
    });

    it('keeps a cookie if already set', () => {
      const response = middleware(
        createMockRequest('/', 'en', 'http://localhost:3000', 'de')
      );
      expect(response.cookies.get('NEXT_LOCALE')).toEqual({
        name: 'NEXT_LOCALE',
        value: 'de'
      });
    });

    it('sets a cookie with locale in the path', () => {
      const response = middleware(createMockRequest('/de'));
      expect(response.cookies.get('NEXT_LOCALE')).toEqual({
        name: 'NEXT_LOCALE',
        value: 'de'
      });
    });

    it('updates a cookie with locale in the path', () => {
      const response = middleware(
        createMockRequest('/de', 'en', 'http://localhost:3000', 'en')
      );
      expect(response.cookies.get('NEXT_LOCALE')).toEqual({
        name: 'NEXT_LOCALE',
        value: 'de'
      });
    });

    it('retains request headers for the default locale', () => {
      middleware(
        createMockRequest('/', 'en', 'http://localhost:3000', undefined, {
          'x-test': 'test'
        })
      );
      expect(
        MockedNextResponse.rewrite.mock.calls[0][1]?.request?.headers?.get(
          'x-test'
        )
      ).toBe('test');
    });

    it('retains request headers for secondary locales', () => {
      middleware(
        createMockRequest('/', 'de', 'http://localhost:3000', undefined, {
          'x-test': 'test'
        })
      );
      expect(
        MockedNextResponse.rewrite.mock.calls[0][1]?.request?.headers?.get(
          'x-test'
        )
      ).toBe('test');
    });

    it('disables the alternate links', () => {
      const response = middleware(createMockRequest('/'));
      expect(response.headers.get('link')).toBe(null);
    });
  });
});

describe('domain-based routing', () => {
  describe('localePrefix: as-needed', () => {
    const middleware = createIntlMiddleware({
      defaultLocale: 'en',
      locales: ['en', 'fr'],
      domains: [
        {defaultLocale: 'en', domain: 'en.example.com', locales: ['en']},
        {
          defaultLocale: 'en',
          domain: 'ca.example.com',
          locales: ['en', 'fr']
        },
        {defaultLocale: 'fr', domain: 'fr.example.com', locales: ['fr']}
      ]
    });

    it('serves requests for the default locale at the root', () => {
      middleware(createMockRequest('/', 'en', 'http://en.example.com'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://en.example.com/en'
      );
    });

    it('serves requests for the default locale at sub paths', () => {
      middleware(createMockRequest('/about', 'en', 'http://en.example.com'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://en.example.com/en/about'
      );
    });

    it('serves requests for the default locale at unknown hosts', () => {
      middleware(createMockRequest('/', 'en', 'http://localhost:3000'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/en'
      );
    });

    it('serves requests for non-default locales at the locale root', () => {
      middleware(createMockRequest('/fr', 'fr', 'http://ca.example.com'));
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).toHaveBeenCalled();
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://ca.example.com/fr'
      );
    });

    it('serves requests for non-default locales at the locale root when the accept-language header points to the default locale', () => {
      middleware(createMockRequest('/fr', 'en', 'http://ca.example.com'));
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).toHaveBeenCalled();
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://ca.example.com/fr'
      );
    });

    it('serves requests for non-default locales at sub paths', () => {
      middleware(createMockRequest('/fr/about', 'fr', 'http://ca.example.com'));
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).toHaveBeenCalled();
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://ca.example.com/fr/about'
      );
    });

    it('returns alternate links', () => {
      const response = middleware(createMockRequest('/'));
      expect(response.headers.get('link')).toBe(
        [
          '<http://en.example.com/>; rel="alternate"; hreflang="en"',
          '<http://ca.example.com/>; rel="alternate"; hreflang="en"',
          '<http://ca.example.com/fr>; rel="alternate"; hreflang="fr"',
          '<http://fr.example.com/>; rel="alternate"; hreflang="fr"'
        ].join(', ')
      );
    });

    describe('unknown hosts', () => {
      it('serves requests for unknown hosts at the root', () => {
        middleware(createMockRequest('/', 'en', 'http://localhost'));
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost/en'
        );
      });

      it('serves requests for unknown hosts at sub paths', () => {
        middleware(createMockRequest('/about', 'en', 'http://localhost'));
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost/en/about'
        );
      });

      it('serves requests for unknown hosts and non-default locales at the locale root', () => {
        middleware(createMockRequest('/fr', 'fr', 'http://localhost'));
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost/fr'
        );
      });

      it('serves requests for unknown hosts and non-default locales at sub paths', () => {
        middleware(createMockRequest('/fr/about', 'fr', 'http://localhost'));
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost/fr/about'
        );
      });
    });

    describe('locales-restricted domain', () => {
      it('serves requests for the default locale at the root when the accept-language header matches', () => {
        middleware(createMockRequest('/', 'en', 'http://ca.example.com'));
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://ca.example.com/en'
        );
      });

      it('serves requests for the default locale at the root when the accept-language header matches the top-level locale', () => {
        middleware(createMockRequest('/', 'en-CA', 'http://ca.example.com'));
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://ca.example.com/en'
        );
      });

      it("serves requests for the default locale at the root when the accept-language header doesn't match", () => {
        middleware(createMockRequest('/', 'en', 'http://fr.example.com'));
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://fr.example.com/fr'
        );
      });

      it('serves requests for the default locale at sub paths when the accept-langauge header matches', () => {
        middleware(createMockRequest('/about', 'en', 'http://ca.example.com'));
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://ca.example.com/en/about'
        );
      });

      it("serves requests for the default locale at sub paths when the accept-langauge header doesn't match", () => {
        middleware(createMockRequest('/about', 'en', 'http://fr.example.com'));
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://fr.example.com/fr/about'
        );
      });

      it('serves requests for non-default locales at the locale root', () => {
        middleware(createMockRequest('/fr', 'fr', 'http://ca.example.com'));
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://ca.example.com/fr'
        );
      });

      it('serves requests for non-default locales at sub paths', () => {
        middleware(
          createMockRequest('/fr/about', 'fr', 'http://ca.example.com')
        );
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://ca.example.com/fr/about'
        );
      });
    });

    describe('redirects for locale prefixes', () => {
      it('redirects for the locale root when the locale matches', () => {
        middleware(
          createMockRequest('/en/about', 'en', 'http://en.example.com')
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://en.example.com/about'
        );
      });

      it('redirects for sub paths when the locale matches', () => {
        middleware(
          createMockRequest('/en/about', 'en', 'http://en.example.com')
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://en.example.com/about'
        );
      });

      it("redirects to another domain for the locale root when the locale doesn't match", () => {
        middleware(
          createMockRequest('/fr/about', 'fr', 'http://en.example.com')
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://fr.example.com/about'
        );
      });

      it("redirects to another domain for sub paths when the locale doesn't match", () => {
        middleware(
          createMockRequest('/fr/about', 'fr', 'http://en.example.com')
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://fr.example.com/about'
        );
      });
    });
  });

  describe("localePrefix: 'always'", () => {
    const middleware = createIntlMiddleware({
      defaultLocale: 'en',
      locales: ['en', 'fr'],
      localePrefix: 'always',
      domains: [
        {defaultLocale: 'en', domain: 'example.com', locales: ['en']},
        {
          defaultLocale: 'en',
          domain: 'ca.example.com',
          locales: ['en', 'fr']
        }
      ]
    });

    it('redirects non-prefixed requests for the default locale', () => {
      middleware(createMockRequest('/', 'en', 'http://example.com'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://example.com/en'
      );
    });

    it('redirects requests for other locales', () => {
      middleware(createMockRequest('/', 'fr', 'http://ca.example.com'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://ca.example.com/fr'
      );
    });

    it('serves requests for the default locale', () => {
      middleware(createMockRequest('/en', 'en', 'http://ca.example.com'));
      middleware(createMockRequest('/en/about', 'en', 'http://ca.example.com'));

      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).toHaveBeenCalledTimes(2);
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://ca.example.com/en'
      );
      expect(MockedNextResponse.rewrite.mock.calls[1][0].toString()).toBe(
        'http://ca.example.com/en/about'
      );
    });

    it('serves requests for non-default locales', () => {
      middleware(createMockRequest('/fr', 'fr', 'http://ca.example.com'));
      middleware(createMockRequest('/fr/about', 'fr', 'http://ca.example.com'));

      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).toHaveBeenCalledTimes(2);
      expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
        'http://ca.example.com/fr'
      );
      expect(MockedNextResponse.rewrite.mock.calls[1][0].toString()).toBe(
        'http://ca.example.com/fr/about'
      );
    });
  });
});

describe('deprecated domain config', () => {
  it("accepts deprecated config with `routing.type: 'prefix'`", () => {
    const middleware = createIntlMiddleware({
      defaultLocale: 'en',
      locales: ['en', 'de'],
      routing: {
        type: 'prefix',
        prefix: 'always'
      }
    });

    middleware(createMockRequest('/', 'en', 'http://example.com'));
    middleware(createMockRequest('/about', 'en', 'http://example.com'));
    middleware(createMockRequest('/de/about', 'de', 'http://example.com'));

    expect(MockedNextResponse.next).not.toHaveBeenCalled();
    expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(2);
    expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
      'http://example.com/en'
    );
    expect(MockedNextResponse.redirect.mock.calls[1][0].toString()).toBe(
      'http://example.com/en/about'
    );
    expect(MockedNextResponse.rewrite).toHaveBeenCalled();
    expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
      'http://example.com/de/about'
    );
  });

  it("accepts deprecated config with `routing.type: 'domain'`", () => {
    const middleware = createIntlMiddleware({
      defaultLocale: 'en',
      locales: ['en', 'de'],
      routing: {
        type: 'domain',
        domains: [
          {
            locale: 'en',
            domain: 'en.example.com'
          },
          {
            locale: 'de',
            domain: 'de.example.com'
          }
        ]
      }
    });

    middleware(createMockRequest('/', 'en', 'http://en.example.com'));
    middleware(createMockRequest('/about', 'en', 'http://en.example.com'));

    expect(MockedNextResponse.next).not.toHaveBeenCalled();
    expect(MockedNextResponse.redirect).not.toHaveBeenCalled();

    expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
      'http://en.example.com/en'
    );
    expect(MockedNextResponse.rewrite.mock.calls[1][0].toString()).toBe(
      'http://en.example.com/en/about'
    );

    middleware(createMockRequest('/en/about', 'en', 'http://en.example.com'));
    expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
      'http://en.example.com/about'
    );

    middleware(createMockRequest('/de/help', 'de', 'http://en.example.com'));

    expect(MockedNextResponse.redirect.mock.calls[1][0].toString()).toBe(
      'http://de.example.com/help'
    );
  });

  it('accepts deprecated config with `domain.locale`', () => {
    const middleware = createIntlMiddleware({
      defaultLocale: 'en',
      locales: ['en', 'de'],
      domains: [
        // @ts-expect-error Deprecated config
        {
          locale: 'en',
          domain: 'en.example.com'
        },
        // @ts-expect-error Deprecated config
        {
          locale: 'de',
          domain: 'de.example.com'
        }
      ]
    });

    middleware(createMockRequest('/', 'en', 'http://en.example.com'));
    middleware(createMockRequest('/about', 'en', 'http://en.example.com'));

    expect(MockedNextResponse.next).not.toHaveBeenCalled();
    expect(MockedNextResponse.redirect).not.toHaveBeenCalled();

    expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
      'http://en.example.com/en'
    );
    expect(MockedNextResponse.rewrite.mock.calls[1][0].toString()).toBe(
      'http://en.example.com/en/about'
    );

    middleware(createMockRequest('/en/about', 'en', 'http://en.example.com'));
    expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
      'http://en.example.com/about'
    );

    middleware(createMockRequest('/de/help', 'de', 'http://en.example.com'));

    expect(MockedNextResponse.redirect.mock.calls[1][0].toString()).toBe(
      'http://de.example.com/help'
    );
  });
});
