// @vitest-environment edge-runtime

import {RequestCookies} from 'next/dist/compiled/@edge-runtime/cookies';
import {NextRequest, NextResponse} from 'next/server';
import {pathToRegexp} from 'path-to-regexp';
import {it, describe, vi, beforeEach, expect, Mock, afterEach} from 'vitest';
import createMiddleware from '../middleware';
import {Pathnames} from '../routing';
import {COOKIE_LOCALE_NAME} from '../shared/constants';

vi.mock('next/server', async (importActual) => {
  const ActualNextServer = (await importActual()) as any;
  type MiddlewareResponseInit = Parameters<(typeof NextResponse)['next']>[0];

  function createResponse(init: MiddlewareResponseInit) {
    const response = new Response(null, init);
    (response as any).cookies = new RequestCookies(
      init?.request?.headers || new Headers()
    );
    return response as NextResponse;
  }
  return {
    ...ActualNextServer,
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
  acceptLanguageLocale = 'en',
  host = 'http://localhost:3000',
  localeCookieValue?: string,
  customHeaders?: HeadersInit
) {
  const headers = new Headers({
    'accept-language': `${acceptLanguageLocale};q=0.9`,
    host: new URL(host).host,
    ...(localeCookieValue && {
      cookie: `${COOKIE_LOCALE_NAME}=${localeCookieValue}`
    }),
    ...customHeaders
  });
  const url = host + pathnameWithSearch;
  return new NextRequest(url, {headers});
}

const MockedNextResponse = NextResponse as unknown as {
  next: Mock<(typeof NextResponse)['next']>;
  rewrite: Mock<(typeof NextResponse)['rewrite']>;
  redirect: Mock<(typeof NextResponse)['redirect']>;
};

function withBasePath(request: NextRequest, basePath = '/base') {
  const url = new URL(request.url);

  url.pathname = basePath + url.pathname;
  if (url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
  }

  const adapted = new NextRequest(url.toString(), {
    ...request,
    headers: request.headers,
    nextConfig: {basePath}
  });

  return adapted;
}

beforeEach(() => {
  vi.clearAllMocks();
});

it('has docs that suggest a reasonable matcher', () => {
  const matcherFromDocs = [
    // Match all pathnames without `.`
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Match all pathnames within `/users`, optionally with a locale prefix
    '/([\\w-]+)?/users/(.+)'
  ];

  const test = [
    ['/', true],
    ['/test', true],
    ['/de/test', true],
    ['/something/else', true],
    ['/encoded%20BV', true],
    ['/users/jane.doe', true],
    ['/de/users/jane.doe', true],
    ['/de-AT/users/jane.doe', true],
    ['/users/jane.doe/profile', true],

    ['/favicon.ico', false],
    ['/icon.ico', false],
    ['/icon.png', false],
    ['/icon.jpg', false],
    ['/icon.jpeg', false],
    ['/icon.svg', false],
    ['/apple-icon.png', false],
    ['/manifest.json', false],
    ['/manifest.webmanifest', false],
    ['/opengraph-image.gif', false],
    ['/twitter-image.png', false],
    ['/robots.txt', false],
    ['/sitemap.xml', false],
    ['/portraits/jane.webp', false],
    ['/something/dot.', false],
    ['/.leading-dot', false],
    ['/api/auth', false],
    ['/_vercel/insights/script.js', false],
    ['/_vercel/insights/view', false],
    ['/test.html', false],
    ['/_next/static/chunks/main-app-123.js?23', false],
    ['/test.html?searchParam=2', false],
    ['/hello/text.txt', false],
    ['/_next/static/chunks/app/%5Blocale%5D/users/%5Bslug%5D/page.js', false]
  ] as const;

  expect(
    test.map(([pathname]) => {
      const matches = matcherFromDocs.some((pattern) =>
        pathname.match(pathToRegexp(pattern))
      );
      return pathname + ': ' + matches;
    })
  ).toEqual(test.map(([pathname, expected]) => pathname + ': ' + expected));
});

describe('prefix-based routing', () => {
  describe('localePrefix: as-needed', () => {
    const middleware = createMiddleware({
      defaultLocale: 'en',
      locales: ['en', 'de'],
      localePrefix: 'as-needed'
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

    it('redirects requests for the default locale when prefixed at the root', () => {
      middleware(createMockRequest('/en'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/'
      );
    });

    it('redirects requests for the default locale when prefixed at the root with search params', () => {
      middleware(createMockRequest('/en?search'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/?search'
      );
    });

    it('redirects requests for the default locale when prefixed at the root with encoded backslashes', () => {
      middleware(createMockRequest('/en/%5Cexample.org'));
      middleware(createMockRequest('/en/%5cexample.org'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/%5Cexample.org'
      );
      expect(MockedNextResponse.redirect.mock.calls[1][0].toString()).toBe(
        'http://localhost:3000/%5Cexample.org'
      );
    });

    it('redirects requests for the default locale when prefixed at the root with excess slashes', () => {
      middleware(createMockRequest('/en///example.org'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/example.org'
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

    it('keeps route segments intact that start with the same characters as the locale', () => {
      middleware(createMockRequest('/en/energy/overview/entry'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/energy/overview/entry'
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
        'http://localhost:3000/de'
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

    it('always provides the locale via a request header, even if a cookie exists with the correct value (see https://github.com/amannn/next-intl/discussions/446)', () => {
      middleware(createMockRequest('/', 'en', 'http://localhost:3000', 'en'));
      expect(MockedNextResponse.rewrite).toHaveBeenCalled();
      expect(
        MockedNextResponse.rewrite.mock.calls[0][1]?.request?.headers?.get(
          'x-next-intl-locale'
        )
      ).toBe('en');
    });

    describe('base path', () => {
      it('rewrites correctly for the default locale at the root', () => {
        middleware(withBasePath(createMockRequest('/')));
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/base/en'
        );
      });

      it('redirects correctly when removing the default locale at the root', () => {
        middleware(withBasePath(createMockRequest('/en')));
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/base'
        );
      });

      it('redirects correctly when removing the default locale at sub paths', () => {
        middleware(withBasePath(createMockRequest('/en/about')));
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/base/about'
        );
      });

      it('redirects correctly when adding a prefix for a non-default locale', () => {
        middleware(withBasePath(createMockRequest('/', 'de')));
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/base/de'
        );
      });

      it('returns alternate links', () => {
        const response = middleware(withBasePath(createMockRequest('/')));
        expect(response.headers.get('link')?.split(', ')).toEqual([
          '<http://localhost:3000/base>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/base/de>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/base>; rel="alternate"; hreflang="x-default"'
        ]);
      });
    });

    describe('localized pathnames', () => {
      const middlewareWithPathnames = createMiddleware({
        defaultLocale: 'en',
        locales: ['en', 'de', 'de-AT', 'ja'],
        localePrefix: 'as-needed',
        pathnames: {
          '/': '/',
          '/about': {
            en: '/about',
            de: '/ueber',
            'de-AT': '/ueber',
            ja: '/約'
          },
          '/users': {
            en: '/users',
            de: '/benutzer',
            'de-AT': '/benutzer',
            ja: '/ユーザー'
          },
          '/users/[userId]': {
            en: '/users/[userId]',
            de: '/benutzer/[userId]',
            'de-AT': '/benutzer/[userId]',
            ja: '/ユーザー/[userId]'
          },
          '/news/[articleSlug]-[articleId]': {
            en: '/news/[articleSlug]-[articleId]',
            de: '/neuigkeiten/[articleSlug]-[articleId]',
            'de-AT': '/neuigkeiten/[articleSlug]-[articleId]',
            ja: '/ニュース/[articleSlug]-[articleId]'
          },
          '/articles/[category]/[articleSlug]': {
            en: '/articles/[category]/[articleSlug]',
            de: '/artikel/[category]/[articleSlug]',
            'de-AT': '/artikel/[category]/[articleSlug]',
            ja: '/記事/[category]/[articleSlug]'
          },
          '/articles/[category]/just-in': {
            en: '/articles/[category]/just-in',
            de: '/artikel/[category]/aktuell',
            'de-AT': '/artikel/[category]/aktuell',
            ja: '/記事/[category]/最新'
          },
          '/products/[...slug]': {
            en: '/products/[...slug]',
            de: '/produkte/[...slug]',
            'de-AT': '/produkte/[...slug]',
            ja: '/製品/[...slug]'
          },
          '/products/[slug]': {
            en: '/products/[slug]',
            de: '/produkte/[slug]',
            'de-AT': '/produkte/[slug]',
            ja: '/製品/[slug]'
          },
          '/products/add': {
            en: '/products/add',
            de: '/produkte/hinzufuegen',
            'de-AT': '/produkte/hinzufuegen',
            ja: '/製品/追加'
          },
          '/categories/[[...slug]]': {
            en: '/categories/[[...slug]]',
            de: '/kategorien/[[...slug]]',
            'de-AT': '/kategorien/[[...slug]]',
            ja: '/カテゴリー/[[...slug]]'
          },
          '/categories/new': {
            en: '/categories/new',
            de: '/kategorien/neu',
            'de-AT': '/kategorien/neu',
            ja: '/カテゴリー/新着'
          }
        } satisfies Pathnames<ReadonlyArray<'en' | 'de' | 'de-AT' | 'ja'>>
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

      it('serves requests for a non-default locale at nested paths', () => {
        middlewareWithPathnames(createMockRequest('/ja/約', 'ja'));
        middlewareWithPathnames(createMockRequest('/ja/ユーザー', 'ja'));
        middlewareWithPathnames(createMockRequest('/ja/ユーザー/1', 'ja'));
        middlewareWithPathnames(
          createMockRequest('/ja/ニュース/happy-newyear-g5b116754', 'ja')
        );
        middlewareWithPathnames(
          createMockRequest('/ja/製品/アパレル/ティーシャツ', 'ja')
        );
        middlewareWithPathnames(
          createMockRequest('/ja/カテゴリー/女性/ティーシャツ', 'ja')
        );

        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalledTimes(6);
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/ja/about'
        );
        expect(MockedNextResponse.rewrite.mock.calls[1][0].toString()).toBe(
          'http://localhost:3000/ja/users'
        );
        expect(MockedNextResponse.rewrite.mock.calls[2][0].toString()).toBe(
          'http://localhost:3000/ja/users/1'
        );
        expect(MockedNextResponse.rewrite.mock.calls[3][0].toString()).toBe(
          'http://localhost:3000/ja/news/happy-newyear-g5b116754'
        );

        // Dynamic segments are expected to be encoded
        expect(MockedNextResponse.rewrite.mock.calls[4][0].toString()).toBe(
          'http://localhost:3000/ja/products/%E3%82%A2%E3%83%91%E3%83%AC%E3%83%AB/%E3%83%86%E3%82%A3%E3%83%BC%E3%82%B7%E3%83%A3%E3%83%84'
        );
        expect(MockedNextResponse.rewrite.mock.calls[5][0].toString()).toBe(
          'http://localhost:3000/ja/categories/%E5%A5%B3%E6%80%A7/%E3%83%86%E3%82%A3%E3%83%BC%E3%82%B7%E3%83%A3%E3%83%84'
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
        middlewareWithPathnames(createMockRequest('/de/users/2?page=1', 'de'));
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(3);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/de/ueber'
        );
        expect(MockedNextResponse.redirect.mock.calls[1][0].toString()).toBe(
          'http://localhost:3000/de/benutzer/2'
        );
        //
        expect(MockedNextResponse.redirect.mock.calls[2][0].toString()).toBe(
          'http://localhost:3000/de/benutzer/2?page=1'
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

      it('redirects uppercase locale requests to case-sensitive defaults at the root', () => {
        middlewareWithPathnames(createMockRequest('/EN', 'de'));
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalled();
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en'
        );
      });

      it('redirects uppercase locale requests to case-sensitive defaults for nested paths', () => {
        middlewareWithPathnames(createMockRequest('/EN/about', 'de'));
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalled();
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en/about'
        );
      });

      it('redirects uppercase locale requests for non-default locales at the root', () => {
        middlewareWithPathnames(createMockRequest('/DE-AT', 'de-AT'));
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalled();
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/de-AT'
        );
      });

      it('redirects uppercase locale requests for non-default locales and nested paths', () => {
        middlewareWithPathnames(createMockRequest('/DE-AT/ueber', 'de-AT'));
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalled();
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/de-AT/ueber'
        );
      });

      it('redirects lowercase locale requests for non-default locales to case-sensitive format at the root', () => {
        middlewareWithPathnames(createMockRequest('/de-at', 'de-AT'));
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalled();
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/de-AT'
        );
      });

      it('redirects lowercase locale requests for non-default locales to case-sensitive format for nested paths', () => {
        middlewareWithPathnames(createMockRequest('/de-at/ueber', 'de-AT'));
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalled();
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/de-AT/ueber'
        );
      });

      it('prioritizes static routes over dynamic and catch-all routes for the non-default locale', () => {
        middlewareWithPathnames(createMockRequest('/products/add', 'en'));
        middlewareWithPathnames(createMockRequest('/categories/new', 'en'));
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalledTimes(2);
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en/products/add'
        );
        expect(MockedNextResponse.rewrite.mock.calls[1][0].toString()).toBe(
          'http://localhost:3000/en/categories/new'
        );
      });

      it('prioritizes static routes over dynamic and catch-all routes for the non-default locale', () => {
        middlewareWithPathnames(
          createMockRequest('/de/produkte/hinzufuegen', 'de')
        );
        middlewareWithPathnames(createMockRequest('/de/kategorien/neu', 'de'));
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalledTimes(2);
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/de/products/add'
        );
        expect(MockedNextResponse.rewrite.mock.calls[1][0].toString()).toBe(
          'http://localhost:3000/de/categories/new'
        );
      });

      it('prioritizes more specific, static routes over dynamic routes for the non-default locale', () => {
        middlewareWithPathnames(
          createMockRequest('/de/artikel/technology/aktuell', 'de')
        );
        middlewareWithPathnames(
          createMockRequest('/de/artikel/technology/neueste-trends', 'de')
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalledTimes(2);
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/de/articles/technology/just-in'
        );
        expect(MockedNextResponse.rewrite.mock.calls[1][0].toString()).toBe(
          'http://localhost:3000/de/articles/technology/neueste-trends'
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
          '<http://localhost:3000/de-AT>; rel="alternate"; hreflang="de-AT"',
          '<http://localhost:3000/ja>; rel="alternate"; hreflang="ja"',
          '<http://localhost:3000/>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(getLinks(createMockRequest('/de', 'de'))).toEqual([
          '<http://localhost:3000/>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/de-AT>; rel="alternate"; hreflang="de-AT"',
          '<http://localhost:3000/ja>; rel="alternate"; hreflang="ja"',
          '<http://localhost:3000/>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(getLinks(createMockRequest('/about', 'en'))).toEqual([
          '<http://localhost:3000/about>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/ueber>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/de-AT/ueber>; rel="alternate"; hreflang="de-AT"',
          '<http://localhost:3000/ja/%E7%B4%84>; rel="alternate"; hreflang="ja"',
          '<http://localhost:3000/about>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(getLinks(createMockRequest('/de/ueber', 'de'))).toEqual([
          '<http://localhost:3000/about>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/ueber>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/de-AT/ueber>; rel="alternate"; hreflang="de-AT"',
          '<http://localhost:3000/ja/%E7%B4%84>; rel="alternate"; hreflang="ja"',
          '<http://localhost:3000/about>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(getLinks(createMockRequest('/users/1', 'en'))).toEqual([
          '<http://localhost:3000/users/1>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/benutzer/1>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/de-AT/benutzer/1>; rel="alternate"; hreflang="de-AT"',
          '<http://localhost:3000/ja/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC/1>; rel="alternate"; hreflang="ja"',
          '<http://localhost:3000/users/1>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(getLinks(createMockRequest('/de/benutzer/1', 'de'))).toEqual([
          '<http://localhost:3000/users/1>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/benutzer/1>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/de-AT/benutzer/1>; rel="alternate"; hreflang="de-AT"',
          '<http://localhost:3000/ja/%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC/1>; rel="alternate"; hreflang="ja"',
          '<http://localhost:3000/users/1>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(
          getLinks(createMockRequest('/products/apparel/t-shirts', 'en'))
        ).toEqual([
          '<http://localhost:3000/products/apparel/t-shirts>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/produkte/apparel/t-shirts>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/de-AT/produkte/apparel/t-shirts>; rel="alternate"; hreflang="de-AT"',
          '<http://localhost:3000/ja/%E8%A3%BD%E5%93%81/apparel/t-shirts>; rel="alternate"; hreflang="ja"',
          '<http://localhost:3000/products/apparel/t-shirts>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(
          getLinks(createMockRequest('/de/produkte/apparel/t-shirts', 'de'))
        ).toEqual([
          '<http://localhost:3000/products/apparel/t-shirts>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/produkte/apparel/t-shirts>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/de-AT/produkte/apparel/t-shirts>; rel="alternate"; hreflang="de-AT"',
          '<http://localhost:3000/ja/%E8%A3%BD%E5%93%81/apparel/t-shirts>; rel="alternate"; hreflang="ja"',
          '<http://localhost:3000/products/apparel/t-shirts>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(getLinks(createMockRequest('/unknown', 'en'))).toEqual([
          '<http://localhost:3000/unknown>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/unknown>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/de-AT/unknown>; rel="alternate"; hreflang="de-AT"',
          '<http://localhost:3000/ja/unknown>; rel="alternate"; hreflang="ja"',
          '<http://localhost:3000/unknown>; rel="alternate"; hreflang="x-default"'
        ]);
        expect(getLinks(createMockRequest('/de/unknown', 'de'))).toEqual([
          '<http://localhost:3000/unknown>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/unknown>; rel="alternate"; hreflang="de"',
          '<http://localhost:3000/de-AT/unknown>; rel="alternate"; hreflang="de-AT"',
          '<http://localhost:3000/ja/unknown>; rel="alternate"; hreflang="ja"',
          '<http://localhost:3000/unknown>; rel="alternate"; hreflang="x-default"'
        ]);
      });

      it('rewrites requests when the pathname is mapped for the default locale as well', () => {
        const callMiddleware = createMiddleware({
          defaultLocale: 'en',
          locales: ['en', 'de'],
          localePrefix: 'as-needed',
          pathnames: {
            '/a': {
              en: '/one',
              de: '/eins'
            },
            '/b/[param]': {
              en: '/two/[param]',
              de: '/zwei/[param]'
            }
          }
        });
        callMiddleware(createMockRequest('/one', 'en'));
        callMiddleware(createMockRequest('/de/eins', 'de'));
        callMiddleware(createMockRequest('/two/2', 'en'));
        callMiddleware(createMockRequest('/de/zwei/2', 'de'));
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalledTimes(4);
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en/a'
        );
        expect(MockedNextResponse.rewrite.mock.calls[1][0].toString()).toBe(
          'http://localhost:3000/de/a'
        );
        expect(MockedNextResponse.rewrite.mock.calls[2][0].toString()).toBe(
          'http://localhost:3000/en/b/2'
        );
        expect(MockedNextResponse.rewrite.mock.calls[3][0].toString()).toBe(
          'http://localhost:3000/de/b/2'
        );
      });
    });

    describe('localized pathnames with different internal and external pathnames', () => {
      const middlewareWithPathnames = createMiddleware({
        defaultLocale: 'en',
        locales: ['en', 'de'],
        localePrefix: 'as-needed',
        pathnames: {
          '/internal': '/external',
          '/internal/foo/bar': {
            en: '/external-en/foo/bar',
            de: '/external-de/foo/bar'
          },
          '/internal/[id]': {
            en: '/external-en/[id]',
            de: '/external-de/[id]'
          },
          '/internal/[...slug]': {
            en: '/external-en/[...slug]',
            de: '/external-de/[...slug]'
          }
        } satisfies Pathnames<ReadonlyArray<'en' | 'de'>>
      });

      it('redirects a request for a localized route to remove the locale prefix while keeping search params at the root', () => {
        middlewareWithPathnames(createMockRequest('/en?hello', 'en'));
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/?hello'
        );
      });

      it('redirects a request for a localized route to remove the locale prefix while keeping search params', () => {
        middlewareWithPathnames(createMockRequest('/en/external?hello', 'en'));
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/external?hello'
        );
      });

      it('redirects an internal route for the default locale', () => {
        middlewareWithPathnames(createMockRequest('/internal?hello', 'en'));
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/external?hello'
        );
      });

      it('redirects an internal route for a secondary locale', () => {
        middlewareWithPathnames(createMockRequest('/internal?hello', 'de'));
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/de/external?hello'
        );
      });

      it('redirects a multi-level internal route for the default locale', () => {
        middlewareWithPathnames(
          createMockRequest('/en/internal/foo/bar?hello', 'en')
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/external-en/foo/bar?hello'
        );
      });

      it('redirects a dynamic internal route for the default locale', () => {
        middlewareWithPathnames(
          createMockRequest('/en/internal/22?hello', 'en')
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/external-en/22?hello'
        );
      });

      it('redirects a multi-level dynamic internal route for the default locale', () => {
        middlewareWithPathnames(
          createMockRequest('/en/internal/22/foo/bar?hello', 'en')
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/external-en/22/foo/bar?hello'
        );
      });

      it('redirects a multi-level dynamic internal route for a secondary locale', () => {
        middlewareWithPathnames(
          createMockRequest('/de/internal/22/foo/bar?hello', 'de')
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/de/external-de/22/foo/bar?hello'
        );
      });
    });
  });

  describe('localePrefix: as-needed, localeDetection: false', () => {
    const middleware = createMiddleware({
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

    it("doesn't set a cookie", () => {
      const response = middleware(
        createMockRequest('/', 'de', 'http://localhost:3000', undefined)
      );
      expect(response.cookies.getAll()).toEqual([]);
    });
  });

  describe('localePrefix: always', () => {
    const middleware = createMiddleware({
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

    describe('base path', () => {
      it('redirects non-prefixed requests for the default locale', () => {
        middleware(withBasePath(createMockRequest('/')));
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/base/en'
        );
      });
    });

    describe('trailingSlash: true', () => {
      beforeEach(() => {
        process.env._next_intl_trailing_slash = 'true';
      });
      afterEach(() => {
        delete process.env._next_intl_trailing_slash;
      });

      it('applies a trailing slash when redirecting to a locale', () => {
        middleware(createMockRequest('/'));
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en/'
        );
      });
    });

    describe('localized pathnames', () => {
      const middlewareWithPathnames = createMiddleware({
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
          '/articles/[category]/[articleSlug]': {
            en: '/articles/[category]/[articleSlug]',
            de: '/artikel/[category]/[articleSlug]'
          },
          '/articles/[category]/just-in': {
            en: '/articles/[category]/just-in',
            de: '/artikel/[category]/aktuell'
          },
          '/products/[...slug]': {
            en: '/products/[...slug]',
            de: '/produkte/[...slug]'
          },
          '/products/[slug]': {
            en: '/products/[slug]',
            de: '/produkte/[slug]'
          },
          '/products/add': {
            en: '/products/add',
            de: '/produkte/hinzufuegen'
          },
          '/categories/[[...slug]]': {
            en: '/categories/[[...slug]]',
            de: '/kategorien/[[...slug]]'
          },
          '/categories/new': {
            en: '/categories/new',
            de: '/kategorien/neu'
          },
          '/internal': '/external',
          '/internal/foo/bar': {
            en: '/external-en/foo/bar',
            de: '/external-de/foo/bar'
          },
          '/internal/[id]': {
            en: '/external-en/[id]',
            de: '/external-de/[id]'
          },
          '/internal/[...slug]': {
            en: '/external-en/[...slug]',
            de: '/external-de/[...slug]'
          }
        } satisfies Pathnames<ReadonlyArray<'en' | 'de'>>
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
        middlewareWithPathnames(createMockRequest('/en/categories', 'en'));
        middlewareWithPathnames(createMockRequest('/en/categories/new', 'en'));

        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalledTimes(6);
        expect(
          MockedNextResponse.rewrite.mock.calls.map((call) =>
            call[0].toString()
          )
        ).toEqual([
          'http://localhost:3000/en/about',
          'http://localhost:3000/en/users',
          'http://localhost:3000/en/users/1',
          'http://localhost:3000/en/news/happy-newyear-g5b116754',
          'http://localhost:3000/en/categories',
          'http://localhost:3000/en/categories/new'
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
        middlewareWithPathnames(createMockRequest('/de/kategorien', 'de'));
        middlewareWithPathnames(createMockRequest('/de/kategorien/neu', 'de'));

        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();

        expect(
          MockedNextResponse.rewrite.mock.calls.map((call) =>
            call[0].toString()
          )
        ).toEqual([
          'http://localhost:3000/de/about',
          'http://localhost:3000/de/users',
          'http://localhost:3000/de/users/1',
          'http://localhost:3000/de/news/gutes-neues-jahr-g5b116754',
          'http://localhost:3000/de/categories',
          'http://localhost:3000/de/categories/new'
        ]);
      });

      it('prioritizes static routes over dynamic and catch-all routes for the default locale', () => {
        middlewareWithPathnames(createMockRequest('/en/products/add', 'en'));
        middlewareWithPathnames(createMockRequest('/en/categories/new', 'en'));
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalledTimes(2);
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en/products/add'
        );
        expect(MockedNextResponse.rewrite.mock.calls[1][0].toString()).toBe(
          'http://localhost:3000/en/categories/new'
        );
      });

      it('prioritizes more specific, static routes over dynamic routes for the default locale', () => {
        middlewareWithPathnames(
          createMockRequest('/en/articles/technology/just-in', 'en')
        );
        middlewareWithPathnames(
          createMockRequest('/en/articles/technology/latest-trends', 'en')
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalledTimes(2);
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en/articles/technology/just-in'
        );
        expect(MockedNextResponse.rewrite.mock.calls[1][0].toString()).toBe(
          'http://localhost:3000/en/articles/technology/latest-trends'
        );
      });

      it('prioritizes static routes over dynamic and catch-all routes for the non-default locale', () => {
        middlewareWithPathnames(
          createMockRequest('/de/produkte/hinzufuegen', 'de')
        );
        middlewareWithPathnames(createMockRequest('/de/kategorien/neu', 'de'));
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalledTimes(2);
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/de/products/add'
        );
        expect(MockedNextResponse.rewrite.mock.calls[1][0].toString()).toBe(
          'http://localhost:3000/de/categories/new'
        );
      });

      it('prioritizes more specific, static routes over dynamic routes for the non-default locale', () => {
        middlewareWithPathnames(
          createMockRequest('/de/artikel/technology/aktuell', 'de')
        );
        middlewareWithPathnames(
          createMockRequest('/de/artikel/technology/neueste-trends', 'de')
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalledTimes(2);
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/de/articles/technology/just-in'
        );
        expect(MockedNextResponse.rewrite.mock.calls[1][0].toString()).toBe(
          'http://localhost:3000/de/articles/technology/neueste-trends'
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
          '<http://localhost:3000/de/ueber>; rel="alternate"; hreflang="de"'
        ]);
        expect(getLinks(createMockRequest('/de/ueber', 'de'))).toEqual([
          '<http://localhost:3000/en/about>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/ueber>; rel="alternate"; hreflang="de"'
        ]);
        expect(getLinks(createMockRequest('/en/users/1', 'en'))).toEqual([
          '<http://localhost:3000/en/users/1>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/benutzer/1>; rel="alternate"; hreflang="de"'
        ]);
        expect(getLinks(createMockRequest('/de/benutzer/1', 'de'))).toEqual([
          '<http://localhost:3000/en/users/1>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/benutzer/1>; rel="alternate"; hreflang="de"'
        ]);
        expect(
          getLinks(createMockRequest('/en/products/apparel/t-shirts', 'en'))
        ).toEqual([
          '<http://localhost:3000/en/products/apparel/t-shirts>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/produkte/apparel/t-shirts>; rel="alternate"; hreflang="de"'
        ]);
        expect(
          getLinks(createMockRequest('/de/produkte/apparel/t-shirts', 'de'))
        ).toEqual([
          '<http://localhost:3000/en/products/apparel/t-shirts>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/produkte/apparel/t-shirts>; rel="alternate"; hreflang="de"'
        ]);
        expect(getLinks(createMockRequest('/en/unknown', 'en'))).toEqual([
          '<http://localhost:3000/en/unknown>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/de/unknown>; rel="alternate"; hreflang="de"'
        ]);
      });

      it('redirects an internal route for the default locale', () => {
        middlewareWithPathnames(createMockRequest('/en/internal', 'en'));
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en/external'
        );
      });

      it('redirects a multi-level internal route for the default locale', () => {
        middlewareWithPathnames(
          createMockRequest('/en/internal/foo/bar', 'en')
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en/external-en/foo/bar'
        );
      });

      it('redirects a dynamic internal route for the default locale', () => {
        middlewareWithPathnames(createMockRequest('/en/internal/22', 'en'));
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en/external-en/22'
        );
      });

      it('redirects a multi-level dynamic internal route for the default locale', () => {
        middlewareWithPathnames(
          createMockRequest('/en/internal/22/foo/bar', 'en')
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en/external-en/22/foo/bar'
        );
      });

      it('redirects a multi-level dynamic internal route for a secondary locale', () => {
        middlewareWithPathnames(
          createMockRequest('/de/internal/22/foo/bar', 'de')
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/de/external-de/22/foo/bar'
        );
      });

      it('allows to map a nested path to the root', () => {
        // https://github.com/amannn/next-intl/issues/940
        const middlewareWithMapping = createMiddleware({
          defaultLocale: 'en',
          locales: ['en', 'de'],
          pathnames: {
            // internal: external
            '/about': '/'
          }
        });

        middlewareWithMapping(createMockRequest('/'));
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en'
        );

        middlewareWithMapping(createMockRequest('/about'));
        expect(MockedNextResponse.redirect.mock.calls[1][0].toString()).toBe(
          'http://localhost:3000/en'
        );

        middlewareWithMapping(createMockRequest('/en/about'));
        expect(MockedNextResponse.redirect.mock.calls[2][0].toString()).toBe(
          'http://localhost:3000/en'
        );

        middlewareWithMapping(createMockRequest('/en'));
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en/about'
        );
      });

      describe('trailingSlash: true', () => {
        beforeEach(() => {
          process.env._next_intl_trailing_slash = 'true';
        });
        afterEach(() => {
          delete process.env._next_intl_trailing_slash;
        });

        it.each(['/de/ueber/', '/de/ueber'])(
          'renders a localized pathname where the internal pathname was defined without a trailing slash',
          (pathname) => {
            middlewareWithPathnames(createMockRequest(pathname));
            expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
            expect(MockedNextResponse.next).not.toHaveBeenCalled();
            expect(MockedNextResponse.rewrite).toHaveBeenCalled();
            expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
              'http://localhost:3000/de/about/'
            );
          }
        );

        it.each(['/de/about/', '/de/about'])(
          'redirects a localized pathname where the internal pathname was defined without a trailing slash',
          (pathname) => {
            middlewareWithPathnames(createMockRequest(pathname));
            expect(MockedNextResponse.redirect).toHaveBeenCalled();
            expect(MockedNextResponse.next).not.toHaveBeenCalled();
            expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
            expect(
              MockedNextResponse.redirect.mock.calls[0][0].toString()
            ).toBe('http://localhost:3000/de/ueber/');
          }
        );

        it.each(['/de/ueber/', '/de/ueber'])(
          'renders a localized pathname where the internal pathname was defined with a trailing slash',
          (pathname) => {
            createMiddleware({
              defaultLocale: 'en',
              locales: ['de'],
              localePrefix: 'always',
              pathnames: {
                '/about/': {de: '/ueber/'}
              }
            })(createMockRequest(pathname));
            expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
            expect(MockedNextResponse.next).not.toHaveBeenCalled();
            expect(MockedNextResponse.rewrite).toHaveBeenCalled();
            expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
              'http://localhost:3000/de/about/'
            );
          }
        );

        it.each(['/de/about/', '/de/about'])(
          'redirects a localized pathname where the internal pathname was defined with a trailing slash',
          (pathname) => {
            createMiddleware({
              defaultLocale: 'en',
              locales: ['de'],
              localePrefix: 'always',
              pathnames: {
                '/about/': {de: '/ueber/'}
              }
            })(createMockRequest(pathname));
            expect(MockedNextResponse.redirect).toHaveBeenCalled();
            expect(MockedNextResponse.next).not.toHaveBeenCalled();
            expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
            expect(
              MockedNextResponse.redirect.mock.calls[0][0].toString()
            ).toBe('http://localhost:3000/de/ueber/');
          }
        );

        it.each([
          [
            '/en/products/t-shirts',
            'http://localhost:3000/en/products/t-shirts/'
          ],
          [
            '/en/products/t-shirts/',
            'http://localhost:3000/en/products/t-shirts/'
          ],
          [
            '/de/produkte/t-shirts',
            'http://localhost:3000/de/products/t-shirts/'
          ],
          [
            '/de/produkte/t-shirts/',
            'http://localhost:3000/de/products/t-shirts/'
          ]
        ])('renders pages with dynamic params', (pathname, rewrite) => {
          middlewareWithPathnames(createMockRequest(pathname));
          expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
          expect(MockedNextResponse.next).not.toHaveBeenCalled();
          expect(MockedNextResponse.rewrite).toHaveBeenCalled();
          expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
            rewrite
          );
        });
      });
    });

    describe('custom prefixes', () => {
      const middlewareWithPrefixes = createMiddleware({
        defaultLocale: 'en',
        locales: ['en', 'en-gb', 'de-at', 'pt'],
        localePrefix: {
          mode: 'always',
          prefixes: {
            // en (defaults to /en)
            'en-gb': '/uk',
            'de-at': '/de/at',
            pt: '/br'
          }
        }
      });

      it('serves requests for the default locale at the root', () => {
        middlewareWithPrefixes(createMockRequest('/en'));
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en'
        );
      });

      it('serves requests for a prefixed locale at the root', () => {
        middlewareWithPrefixes(createMockRequest('/uk?test'));
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en-gb?test'
        );
      });

      it('serves requests for the default locale at nested paths', () => {
        middlewareWithPrefixes(createMockRequest('/en/about'));
        expect(MockedNextResponse.rewrite).toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en/about'
        );
      });

      it('serves requests for a prefixed locale at nested paths', () => {
        middlewareWithPrefixes(createMockRequest('/uk/about'));
        middlewareWithPrefixes(createMockRequest('/de/at/about'));
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en-gb/about'
        );
        expect(MockedNextResponse.rewrite.mock.calls[1][0].toString()).toBe(
          'http://localhost:3000/de-at/about'
        );
      });

      it('redirects requests at the root to a custom prefix', () => {
        middlewareWithPrefixes(createMockRequest('/', 'de-at'));
        expect(MockedNextResponse.redirect).toHaveBeenCalled();
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/de/at'
        );
      });

      it("redirects requests to add a locale prefix if it's missing", () => {
        middlewareWithPrefixes(createMockRequest('/about', 'en-gb'));
        expect(MockedNextResponse.redirect).toHaveBeenCalled();
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/uk/about'
        );
      });

      it('redirects requests for a case mismatch of a custom prefix', () => {
        middlewareWithPrefixes(createMockRequest('/UK'));
        middlewareWithPrefixes(createMockRequest('/de/AT'));
        expect(MockedNextResponse.redirect).toHaveBeenCalled();
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/uk'
        );
        expect(MockedNextResponse.redirect.mock.calls[1][0].toString()).toBe(
          'http://localhost:3000/de/at'
        );
      });

      it('sets alternate links', () => {
        function getLinks(request: NextRequest) {
          return middlewareWithPrefixes(request)
            .headers.get('link')
            ?.split(', ');
        }

        ['/en', '/uk', '/de/at'].forEach((pathname) => {
          expect(getLinks(createMockRequest(pathname))).toEqual([
            '<http://localhost:3000/en>; rel="alternate"; hreflang="en"',
            '<http://localhost:3000/uk>; rel="alternate"; hreflang="en-gb"',
            '<http://localhost:3000/de/at>; rel="alternate"; hreflang="de-at"',
            '<http://localhost:3000/br>; rel="alternate"; hreflang="pt"',
            '<http://localhost:3000/>; rel="alternate"; hreflang="x-default"'
          ]);
        });

        ['/en/about', '/uk/about', '/de/at/about'].forEach((pathname) => {
          expect(getLinks(createMockRequest(pathname))).toEqual([
            '<http://localhost:3000/en/about>; rel="alternate"; hreflang="en"',
            '<http://localhost:3000/uk/about>; rel="alternate"; hreflang="en-gb"',
            '<http://localhost:3000/de/at/about>; rel="alternate"; hreflang="de-at"',
            '<http://localhost:3000/br/about>; rel="alternate"; hreflang="pt"'
          ]);
        });

        expect(getLinks(createMockRequest('/en/unknown'))).toEqual([
          '<http://localhost:3000/en/unknown>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/uk/unknown>; rel="alternate"; hreflang="en-gb"',
          '<http://localhost:3000/de/at/unknown>; rel="alternate"; hreflang="de-at"',
          '<http://localhost:3000/br/unknown>; rel="alternate"; hreflang="pt"'
        ]);
      });
    });

    describe('custom prefixes with pathnames', () => {
      const middlewareWithPrefixes = createMiddleware({
        defaultLocale: 'en',
        locales: ['en', 'en-gb', 'de-at', 'pt'],
        localePrefix: {
          mode: 'always',
          prefixes: {
            // en (defaults to /en)
            'en-gb': '/uk',
            'de-at': '/de/at',
            pt: '/br'
          }
        },
        pathnames: {
          '/': '/',
          '/about': {
            en: '/about',
            'de-at': '/ueber',
            'en-gb': '/about',
            pt: '/sobre'
          }
        } satisfies Pathnames<ReadonlyArray<'en' | 'en-gb' | 'de-at' | 'pt'>>
      });

      it('serves requests for the default locale at the root', () => {
        middlewareWithPrefixes(createMockRequest('/en', 'en'));
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en'
        );
      });

      it('serves requests for a prefixed locale at the root', () => {
        middlewareWithPrefixes(createMockRequest('/uk?test'));
        middlewareWithPrefixes(createMockRequest('/de/at?test'));
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en-gb?test'
        );
        expect(MockedNextResponse.rewrite.mock.calls[1][0].toString()).toBe(
          'http://localhost:3000/de-at?test'
        );
      });

      it('serves requests for the default locale at nested paths', () => {
        middlewareWithPrefixes(createMockRequest('/en/about'));
        expect(MockedNextResponse.rewrite).toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en/about'
        );
      });

      it('serves requests for a prefixed locale at nested paths', () => {
        middlewareWithPrefixes(createMockRequest('/uk/about'));
        middlewareWithPrefixes(createMockRequest('/de/at/ueber'));
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en-gb/about'
        );
        expect(MockedNextResponse.rewrite.mock.calls[1][0].toString()).toBe(
          'http://localhost:3000/de-at/about'
        );
      });

      it('redirects requests at the root to a custom prefix', () => {
        middlewareWithPrefixes(createMockRequest('/', 'de-at'));
        expect(MockedNextResponse.redirect).toHaveBeenCalled();
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/de/at'
        );
      });

      it("redirects requests to add a locale prefix if it's missing", () => {
        middlewareWithPrefixes(createMockRequest('/about', 'en-gb'));
        expect(MockedNextResponse.redirect).toHaveBeenCalled();
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/uk/about'
        );
      });

      it('redirects requests for a case mismatch of a custom prefix', () => {
        middlewareWithPrefixes(createMockRequest('/UK'));
        middlewareWithPrefixes(createMockRequest('/de/AT'));
        expect(MockedNextResponse.redirect).toHaveBeenCalled();
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/uk'
        );
        expect(MockedNextResponse.redirect.mock.calls[1][0].toString()).toBe(
          'http://localhost:3000/de/at'
        );
      });

      it('sets alternate links', () => {
        function getLinks(request: NextRequest) {
          return middlewareWithPrefixes(request)
            .headers.get('link')
            ?.split(', ');
        }

        ['/en', '/uk', '/de/at'].forEach((pathname) => {
          expect(getLinks(createMockRequest(pathname))).toEqual([
            '<http://localhost:3000/en>; rel="alternate"; hreflang="en"',
            '<http://localhost:3000/uk>; rel="alternate"; hreflang="en-gb"',
            '<http://localhost:3000/de/at>; rel="alternate"; hreflang="de-at"',
            '<http://localhost:3000/br>; rel="alternate"; hreflang="pt"',
            '<http://localhost:3000/>; rel="alternate"; hreflang="x-default"'
          ]);
        });

        ['/en/about', '/uk/about', '/de/at/ueber'].forEach((pathname) => {
          expect(getLinks(createMockRequest(pathname))).toEqual([
            '<http://localhost:3000/en/about>; rel="alternate"; hreflang="en"',
            '<http://localhost:3000/uk/about>; rel="alternate"; hreflang="en-gb"',
            '<http://localhost:3000/de/at/ueber>; rel="alternate"; hreflang="de-at"',
            '<http://localhost:3000/br/sobre>; rel="alternate"; hreflang="pt"'
          ]);
        });

        expect(getLinks(createMockRequest('/en/unknown'))).toEqual([
          '<http://localhost:3000/en/unknown>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/uk/unknown>; rel="alternate"; hreflang="en-gb"',
          '<http://localhost:3000/de/at/unknown>; rel="alternate"; hreflang="de-at"',
          '<http://localhost:3000/br/unknown>; rel="alternate"; hreflang="pt"'
        ]);
      });
    });
  });

  describe('localePrefix: never', () => {
    const middleware = createMiddleware({
      defaultLocale: 'en',
      locales: ['en', 'de', 'de-AT'],
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

    it('keeps search params when removing the locale via a redirect', () => {
      middleware(createMockRequest('/en?test=1'));
      middleware(createMockRequest('/en/about?test=1'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/?test=1'
      );
      expect(MockedNextResponse.redirect.mock.calls[1][0].toString()).toBe(
        'http://localhost:3000/about?test=1'
      );
    });

    it('keeps route segments intact that start with the same characters as the default locale', () => {
      middleware(createMockRequest('/en/energy/overview/entry'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/energy/overview/entry'
      );
    });

    it('keeps route segments intact that start with the same characters as a non-default locale', () => {
      middleware(createMockRequest('/de/dentist/overview/delete'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/dentist/overview/delete'
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

    it('redirects requests with uppercase default locale in a nested path', () => {
      middleware(createMockRequest('/EN/list'));
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/list'
      );
    });

    it('redirects requests with uppercase non-default locale in a nested path', () => {
      middleware(createMockRequest('/DE-AT/list'));
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://localhost:3000/list'
      );
    });

    it('redirects requests with lowercase non-default locale in a nested path', () => {
      middleware(createMockRequest('/de-at/list'));
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).toHaveBeenCalled();
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

    describe('base path', () => {
      it('redirects requests with default locale in the path', () => {
        middleware(withBasePath(createMockRequest('/en')));
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/base'
        );
      });
    });

    describe('localized pathnames', () => {
      const middlewareWithPathnames = createMiddleware({
        defaultLocale: 'en',
        locales: ['en', 'de'],
        localePrefix: 'never',
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
          '/internal': '/external',
          '/internal/foo/bar': {
            en: '/external-en/foo/bar',
            de: '/external-de/foo/bar'
          },
          '/internal/[id]': {
            en: '/external-en/[id]',
            de: '/external-de/[id]'
          },
          '/internal/[...slug]': {
            en: '/external-en/[...slug]',
            de: '/external-de/[...slug]'
          }
        } satisfies Pathnames<ReadonlyArray<'en' | 'de'>>
      });

      it('serves requests for the default locale at the root', () => {
        middlewareWithPathnames(createMockRequest('/', 'en'));
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalled();
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
        middlewareWithPathnames(createMockRequest('/', 'de'));
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/de'
        );
      });

      it('serves requests for a non-default locale at nested paths', () => {
        middlewareWithPathnames(createMockRequest('/ueber', 'de'));
        middlewareWithPathnames(createMockRequest('/benutzer', 'de'));
        middlewareWithPathnames(createMockRequest('/benutzer/1', 'de'));
        middlewareWithPathnames(
          createMockRequest('/neuigkeiten/gutes-neues-jahr-g5b116754', 'de')
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
          'http://localhost:3000/about'
        );
        expect(MockedNextResponse.redirect.mock.calls[1][0].toString()).toBe(
          'http://localhost:3000/users/12'
        );
      });

      it('redirects a request for a localized route to remove the locale prefix while keeping search params', () => {
        middlewareWithPathnames(createMockRequest('/de/ueber?hello', 'de'));
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/ueber?hello'
        );
      });

      it('redirects an internal route for the default locale', () => {
        middlewareWithPathnames(createMockRequest('/internal?hello', 'en'));
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/external?hello'
        );
      });

      it('redirects an internal route for a secondary locale', () => {
        middlewareWithPathnames(createMockRequest('/internal?hello', 'de'));
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/external?hello'
        );
      });

      it('redirects a multi-level internal route for the default locale', () => {
        middlewareWithPathnames(
          createMockRequest('/internal/foo/bar?hello', 'en')
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/external-en/foo/bar?hello'
        );
      });

      it('redirects a multi-level internal route for the default locale when a locale prefix is added', () => {
        middlewareWithPathnames(
          createMockRequest('/en/internal/foo/bar?hello', 'en')
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/external-en/foo/bar?hello'
        );
      });

      it('redirects a dynamic internal route for the default locale', () => {
        middlewareWithPathnames(createMockRequest('/internal/22?hello', 'en'));
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/external-en/22?hello'
        );
      });

      it('redirects a dynamic internal route for the default locale', () => {
        middlewareWithPathnames(
          createMockRequest('/internal/22/foo/bar?hello', 'en')
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/external-en/22/foo/bar?hello'
        );
      });

      it('redirects a dynamic internal route for a secondary locale', () => {
        middlewareWithPathnames(
          createMockRequest('/internal/22/foo/bar?hello', 'de')
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/external-de/22/foo/bar?hello'
        );
      });
    });
  });
});

describe('domain-based routing', () => {
  describe('localePrefix: as-needed', () => {
    const middleware = createMiddleware({
      defaultLocale: 'en',
      locales: ['en', 'fr'],
      localePrefix: 'as-needed',
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

    it('prioritizes the default locale of a domain', () => {
      const m = createMiddleware({
        defaultLocale: 'en',
        locales: ['en', 'fr'],
        domains: [
          {
            defaultLocale: 'fr',
            domain: 'ca.example.com'
          }
        ]
      });
      m(createMockRequest('/', 'de', 'http://ca.example.com'));
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://ca.example.com/fr'
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
          'http://fr.example.com/fr/about'
        );
      });

      it("redirects to another domain for sub paths when the locale doesn't match", () => {
        middleware(
          createMockRequest('/fr/about', 'fr', 'http://en.example.com')
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://fr.example.com/fr/about'
        );
      });

      it("redirects to another domain when the locale isn't supported on the current domain", () => {
        middleware(
          createMockRequest('/en/about', 'en', 'http://fr.example.com')
        );
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://en.example.com/en/about'
        );
      });

      describe('base path', () => {
        it('redirects requests with default locale in the path', () => {
          middleware(
            withBasePath(
              createMockRequest('/en/about', 'en', 'http://en.example.com')
            )
          );
          expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
            'http://en.example.com/base/about'
          );
        });

        it('returns alternate links', () => {
          const response = middleware(
            withBasePath(createMockRequest('/', 'en', 'http://en.example.com'))
          );
          expect(response.headers.get('link')?.split(', ')).toEqual([
            '<http://en.example.com/base>; rel="alternate"; hreflang="en"',
            '<http://ca.example.com/base>; rel="alternate"; hreflang="en"',
            '<http://ca.example.com/base/fr>; rel="alternate"; hreflang="fr"',
            '<http://fr.example.com/base>; rel="alternate"; hreflang="fr"'
          ]);
        });
      });
    });

    describe('localized pathnames', () => {
      const middlewareWithPathnames = createMiddleware({
        defaultLocale: 'en',
        locales: ['en', 'fr'],
        localePrefix: 'as-needed',
        domains: [
          {defaultLocale: 'en', domain: 'en.example.com', locales: ['en']},
          {
            defaultLocale: 'en',
            domain: 'ca.example.com',
            locales: ['en', 'fr']
          },
          {defaultLocale: 'fr', domain: 'fr.example.com', locales: ['fr']}
        ],
        pathnames: {
          '/': '/',
          '/about': {
            en: '/about',
            fr: '/a-propos'
          },
          '/users': {
            en: '/users',
            fr: '/utilisateurs'
          },
          '/users/[userId]': {
            en: '/users/[userId]',
            fr: '/utilisateurs/[userId]'
          },
          '/news/[articleSlug]-[articleId]': {
            en: '/news/[articleSlug]-[articleId]',
            fr: '/nouvelles/[articleSlug]-[articleId]'
          },
          '/products/[...slug]': {
            en: '/products/[...slug]',
            fr: '/produits/[...slug]'
          },
          '/categories/[[...slug]]': {
            en: '/categories/[[...slug]]',
            fr: '/categories/[[...slug]]'
          },
          '/internal': '/external',
          '/internal/foo/bar': {
            en: '/external-en/foo/bar',
            fr: '/external-fr/foo/bar'
          },
          '/internal/[id]': {
            en: '/external-en/[id]',
            fr: '/external-fr/[id]'
          },
          '/internal/[...slug]': {
            en: '/external-en/[...slug]',
            fr: '/external-fr/[...slug]'
          }
        } satisfies Pathnames<ReadonlyArray<'en' | 'fr'>>
      });

      it('serves requests for the default locale at the root', () => {
        middlewareWithPathnames(
          createMockRequest('/', 'en', 'http://en.example.com')
        );
        middlewareWithPathnames(
          createMockRequest('/', 'en', 'http://ca.example.com')
        );
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalledTimes(2);
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://en.example.com/en'
        );
        expect(MockedNextResponse.rewrite.mock.calls[1][0].toString()).toBe(
          'http://ca.example.com/en'
        );
      });

      it('serves requests for the default locale at nested paths', () => {
        middlewareWithPathnames(
          createMockRequest('/about', 'en', 'http://en.example.com')
        );
        middlewareWithPathnames(
          createMockRequest('/users', 'en', 'http://en.example.com')
        );
        middlewareWithPathnames(
          createMockRequest('/users/1', 'en', 'http://en.example.com')
        );
        middlewareWithPathnames(
          createMockRequest(
            '/news/happy-newyear-g5b116754',
            'en',
            'http://en.example.com'
          )
        );
        middlewareWithPathnames(
          createMockRequest(
            '/products/apparel/t-shirts',
            'en',
            'http://en.example.com'
          )
        );
        middlewareWithPathnames(
          createMockRequest(
            '/categories/women/t-shirts',
            'en',
            'http://en.example.com'
          )
        );

        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalledTimes(6);
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://en.example.com/en/about'
        );
        expect(MockedNextResponse.rewrite.mock.calls[1][0].toString()).toBe(
          'http://en.example.com/en/users'
        );
        expect(MockedNextResponse.rewrite.mock.calls[2][0].toString()).toBe(
          'http://en.example.com/en/users/1'
        );
        expect(MockedNextResponse.rewrite.mock.calls[3][0].toString()).toBe(
          'http://en.example.com/en/news/happy-newyear-g5b116754'
        );
        expect(MockedNextResponse.rewrite.mock.calls[4][0].toString()).toBe(
          'http://en.example.com/en/products/apparel/t-shirts'
        );
        expect(MockedNextResponse.rewrite.mock.calls[5][0].toString()).toBe(
          'http://en.example.com/en/categories/women/t-shirts'
        );
      });

      it('serves requests for a non-default locale at the root', () => {
        middlewareWithPathnames(
          createMockRequest('/fr', 'fr', 'http://ca.example.com')
        );
        expect(MockedNextResponse.rewrite).toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled(); // We rewrite just in case
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://ca.example.com/fr'
        );
      });

      it('serves requests for a non-default locale at nested paths', () => {
        middlewareWithPathnames(
          createMockRequest('/fr/a-propos', 'fr', 'http://ca.example.com')
        );
        middlewareWithPathnames(
          createMockRequest('/fr/utilisateurs', 'fr', 'http://ca.example.com')
        );
        middlewareWithPathnames(
          createMockRequest('/fr/utilisateurs/1', 'fr', 'http://ca.example.com')
        );
        middlewareWithPathnames(
          createMockRequest(
            '/fr/nouvelles/happy-newyear-g5b116754',
            'fr',
            'http://ca.example.com'
          )
        );
        middlewareWithPathnames(
          createMockRequest(
            '/fr/produits/vetements/t-shirts',
            'fr',
            'http://ca.example.com'
          )
        );
        middlewareWithPathnames(
          createMockRequest(
            '/fr/categories/femmes/t-shirts',
            'fr',
            'http://ca.example.com'
          )
        );

        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalledTimes(6);
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://ca.example.com/fr/about'
        );
        expect(MockedNextResponse.rewrite.mock.calls[1][0].toString()).toBe(
          'http://ca.example.com/fr/users'
        );
        expect(MockedNextResponse.rewrite.mock.calls[2][0].toString()).toBe(
          'http://ca.example.com/fr/users/1'
        );
        expect(MockedNextResponse.rewrite.mock.calls[3][0].toString()).toBe(
          'http://ca.example.com/fr/news/happy-newyear-g5b116754'
        );
        expect(MockedNextResponse.rewrite.mock.calls[4][0].toString()).toBe(
          'http://ca.example.com/fr/products/vetements/t-shirts'
        );
        expect(MockedNextResponse.rewrite.mock.calls[5][0].toString()).toBe(
          'http://ca.example.com/fr/categories/femmes/t-shirts'
        );
      });

      it('redirects a request for a localized route that is not associated with the requested locale', () => {
        middlewareWithPathnames(
          createMockRequest('/a-propos', 'en', 'http://en.example.com')
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://en.example.com/about'
        );
      });

      it('redirects when a pathname from the default locale ends up with a different locale that is the default locale on the domain', () => {
        // Relevant to avoid duplicate content issues
        middlewareWithPathnames(
          createMockRequest('/about', 'fr', 'http://fr.example.com')
        );
        middlewareWithPathnames(
          createMockRequest('/users/2', 'fr', 'http://fr.example.com')
        );
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(2);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://fr.example.com/a-propos'
        );
        expect(MockedNextResponse.redirect.mock.calls[1][0].toString()).toBe(
          'http://fr.example.com/utilisateurs/2'
        );
      });

      it('redirects when a pathname from the default locale ends up with a different locale that is a secondary locale on the domain', () => {
        // Relevant to avoid duplicate content issues
        middlewareWithPathnames(
          createMockRequest('/about', 'fr', 'http://ca.example.com')
        );
        middlewareWithPathnames(
          createMockRequest('/users/2', 'fr', 'http://ca.example.com')
        );
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(2);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://ca.example.com/fr/a-propos'
        );
        expect(MockedNextResponse.redirect.mock.calls[1][0].toString()).toBe(
          'http://ca.example.com/fr/utilisateurs/2'
        );
      });

      it('redirects a non-prefixed nested path to a localized alternative if another locale was detected', () => {
        middlewareWithPathnames(
          createMockRequest('/about', 'fr', 'http://ca.example.com')
        );
        middlewareWithPathnames(
          createMockRequest('/users/2', 'fr', 'http://ca.example.com')
        );
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(2);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://ca.example.com/fr/a-propos'
        );
        expect(MockedNextResponse.redirect.mock.calls[1][0].toString()).toBe(
          'http://ca.example.com/fr/utilisateurs/2'
        );
      });

      it('sets alternate links', () => {
        function getLinks(request: NextRequest) {
          return middlewareWithPathnames(request)
            .headers.get('link')
            ?.split(', ');
        }

        expect(
          getLinks(createMockRequest('/', 'en', 'http://en.example.com'))
        ).toEqual([
          '<http://en.example.com/>; rel="alternate"; hreflang="en"',
          '<http://ca.example.com/>; rel="alternate"; hreflang="en"',
          '<http://ca.example.com/fr>; rel="alternate"; hreflang="fr"',
          '<http://fr.example.com/>; rel="alternate"; hreflang="fr"'
        ]);
        expect(
          getLinks(createMockRequest('/fr', 'fr', 'http://ca.example.com'))
        ).toEqual([
          '<http://en.example.com/>; rel="alternate"; hreflang="en"',
          '<http://ca.example.com/>; rel="alternate"; hreflang="en"',
          '<http://ca.example.com/fr>; rel="alternate"; hreflang="fr"',
          '<http://fr.example.com/>; rel="alternate"; hreflang="fr"'
        ]);
        expect(
          getLinks(createMockRequest('/about', 'en', 'http://en.example.com'))
        ).toEqual([
          '<http://en.example.com/about>; rel="alternate"; hreflang="en"',
          '<http://ca.example.com/about>; rel="alternate"; hreflang="en"',
          '<http://ca.example.com/fr/a-propos>; rel="alternate"; hreflang="fr"',
          '<http://fr.example.com/a-propos>; rel="alternate"; hreflang="fr"'
        ]);
        expect(
          getLinks(
            createMockRequest('/a-propos', 'fr', 'http://ca.example.com')
          )
        ).toEqual([
          '<http://en.example.com/about>; rel="alternate"; hreflang="en"',
          '<http://ca.example.com/about>; rel="alternate"; hreflang="en"',
          '<http://ca.example.com/fr/a-propos>; rel="alternate"; hreflang="fr"',
          '<http://fr.example.com/a-propos>; rel="alternate"; hreflang="fr"'
        ]);
        expect(
          getLinks(createMockRequest('/users/1', 'en', 'http://en.example.com'))
        ).toEqual([
          '<http://en.example.com/users/1>; rel="alternate"; hreflang="en"',
          '<http://ca.example.com/users/1>; rel="alternate"; hreflang="en"',
          '<http://ca.example.com/fr/utilisateurs/1>; rel="alternate"; hreflang="fr"',
          '<http://fr.example.com/utilisateurs/1>; rel="alternate"; hreflang="fr"'
        ]);
        expect(
          getLinks(
            createMockRequest('/utilisateurs/1', 'fr', 'http://fr.example.com')
          )
        ).toEqual([
          '<http://en.example.com/users/1>; rel="alternate"; hreflang="en"',
          '<http://ca.example.com/users/1>; rel="alternate"; hreflang="en"',
          '<http://ca.example.com/fr/utilisateurs/1>; rel="alternate"; hreflang="fr"',
          '<http://fr.example.com/utilisateurs/1>; rel="alternate"; hreflang="fr"'
        ]);
        expect(
          getLinks(
            createMockRequest(
              '/products/apparel/t-shirts',
              'en',
              'http://en.example.com'
            )
          )
        ).toEqual([
          '<http://en.example.com/products/apparel/t-shirts>; rel="alternate"; hreflang="en"',
          '<http://ca.example.com/products/apparel/t-shirts>; rel="alternate"; hreflang="en"',
          '<http://ca.example.com/fr/produits/apparel/t-shirts>; rel="alternate"; hreflang="fr"',
          '<http://fr.example.com/produits/apparel/t-shirts>; rel="alternate"; hreflang="fr"'
        ]);
        expect(
          getLinks(
            createMockRequest(
              '/fr/produits/apparel/t-shirts',
              'fr',
              'http://fr.example.com'
            )
          )
        ).toEqual([
          '<http://en.example.com/products/apparel/t-shirts>; rel="alternate"; hreflang="en"',
          '<http://ca.example.com/products/apparel/t-shirts>; rel="alternate"; hreflang="en"',
          '<http://ca.example.com/fr/produits/apparel/t-shirts>; rel="alternate"; hreflang="fr"',
          '<http://fr.example.com/produits/apparel/t-shirts>; rel="alternate"; hreflang="fr"'
        ]);
        expect(
          getLinks(createMockRequest('/unknown', 'en', 'http://en.example.com'))
        ).toEqual([
          '<http://en.example.com/unknown>; rel="alternate"; hreflang="en"',
          '<http://ca.example.com/unknown>; rel="alternate"; hreflang="en"',
          '<http://ca.example.com/fr/unknown>; rel="alternate"; hreflang="fr"',
          '<http://fr.example.com/unknown>; rel="alternate"; hreflang="fr"'
        ]);
        expect(
          getLinks(
            createMockRequest('/fr/unknown', 'fr', 'http://ca.example.com')
          )
        ).toEqual([
          '<http://en.example.com/unknown>; rel="alternate"; hreflang="en"',
          '<http://ca.example.com/unknown>; rel="alternate"; hreflang="en"',
          '<http://ca.example.com/fr/unknown>; rel="alternate"; hreflang="fr"',
          '<http://fr.example.com/unknown>; rel="alternate"; hreflang="fr"'
        ]);
      });

      describe('base path', () => {
        it('redirects requests with default locale in the path', () => {
          const request = withBasePath(
            createMockRequest('/en/about', 'en', 'http://en.example.com')
          );
          middlewareWithPathnames(request);
          expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
            'http://en.example.com/base/about'
          );
        });

        it('returns alternate links', () => {
          const request = withBasePath(
            createMockRequest('/', 'en', 'http://en.example.com')
          );
          const response = middlewareWithPathnames(request);
          expect(response.headers.get('link')?.split(', ')).toEqual([
            '<http://en.example.com/base>; rel="alternate"; hreflang="en"',
            '<http://ca.example.com/base>; rel="alternate"; hreflang="en"',
            '<http://ca.example.com/base/fr>; rel="alternate"; hreflang="fr"',
            '<http://fr.example.com/base>; rel="alternate"; hreflang="fr"'
          ]);
        });
      });

      it('redirects an internal route for the default locale', () => {
        middlewareWithPathnames(
          createMockRequest('/internal', 'en', 'http://ca.example.com')
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://ca.example.com/external'
        );
      });

      it('redirects an internal route for a secondary locale', () => {
        middlewareWithPathnames(
          createMockRequest('/internal', 'fr', 'http://ca.example.com')
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://ca.example.com/fr/external'
        );
      });

      it('redirects a multi-level internal route for the default locale', () => {
        middlewareWithPathnames(
          createMockRequest('/internal/foo/bar', 'en', 'http://ca.example.com')
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://ca.example.com/external-en/foo/bar'
        );
      });

      it('redirects a dynamic internal route for the default locale', () => {
        middlewareWithPathnames(
          createMockRequest('/internal/22', 'en', 'http://ca.example.com')
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://ca.example.com/external-en/22'
        );
      });

      it('redirects a dynamic internal route for the default locale', () => {
        middlewareWithPathnames(
          createMockRequest(
            '/internal/22/foo/bar',
            'en',
            'http://ca.example.com'
          )
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://ca.example.com/external-en/22/foo/bar'
        );
      });

      it('redirects a dynamic internal route for a secondary locale', () => {
        middlewareWithPathnames(
          createMockRequest(
            '/internal/22/foo/bar',
            'fr',
            'http://ca.example.com'
          )
        );
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).toHaveBeenCalledTimes(1);
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://ca.example.com/fr/external-fr/22/foo/bar'
        );
      });
    });

    describe('custom prefixes with pathnames', () => {
      const middlewareWithPrefixes = createMiddleware({
        defaultLocale: 'en',
        locales: ['en', 'en-gb'],
        localePrefix: {
          mode: 'as-needed',
          prefixes: {
            'en-gb': '/uk'
          }
        },
        pathnames: {
          '/': '/',
          '/about': {
            en: '/about',
            'en-gb': '/about'
          }
        } satisfies Pathnames<ReadonlyArray<'en' | 'en-gb'>>
      });

      it('serves requests for the default locale at the root', () => {
        middlewareWithPrefixes(createMockRequest('/', 'en'));
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en'
        );
      });

      it('serves requests for a prefixed locale at the root', () => {
        middlewareWithPrefixes(createMockRequest('/uk'));
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en-gb'
        );
      });

      it('serves requests for the default locale at nested paths', () => {
        middlewareWithPrefixes(createMockRequest('/about', 'en'));
        expect(MockedNextResponse.rewrite).toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en/about'
        );
      });

      it('serves requests for a prefixed locale at nested paths', () => {
        middlewareWithPrefixes(createMockRequest('/uk/about'));
        expect(MockedNextResponse.next).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).toHaveBeenCalled();
        expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
          'http://localhost:3000/en-gb/about'
        );
      });

      it('sets alternate links', () => {
        function getLinks(request: NextRequest) {
          return middlewareWithPrefixes(request)
            .headers.get('link')
            ?.split(', ');
        }

        ['/en', '/uk'].forEach((pathname) => {
          expect(getLinks(createMockRequest(pathname))).toEqual([
            '<http://localhost:3000/>; rel="alternate"; hreflang="en"',
            '<http://localhost:3000/uk>; rel="alternate"; hreflang="en-gb"',
            '<http://localhost:3000/>; rel="alternate"; hreflang="x-default"'
          ]);
        });

        ['/en/about', '/uk/about'].forEach((pathname) => {
          expect(getLinks(createMockRequest(pathname))).toEqual([
            '<http://localhost:3000/about>; rel="alternate"; hreflang="en"',
            '<http://localhost:3000/uk/about>; rel="alternate"; hreflang="en-gb"',
            '<http://localhost:3000/about>; rel="alternate"; hreflang="x-default"'
          ]);
        });

        expect(getLinks(createMockRequest('/en/unknown'))).toEqual([
          '<http://localhost:3000/unknown>; rel="alternate"; hreflang="en"',
          '<http://localhost:3000/uk/unknown>; rel="alternate"; hreflang="en-gb"',
          '<http://localhost:3000/unknown>; rel="alternate"; hreflang="x-default"'
        ]);
      });
    });
  });

  describe("localePrefix: 'always'", () => {
    const middleware = createMiddleware({
      defaultLocale: 'en',
      locales: ['en', 'fr'],
      localePrefix: 'always',
      domains: [
        {
          defaultLocale: 'en',
          domain: 'example.com',
          locales: ['en']
        },
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

    it('uses the correct port and protocol', () => {
      middleware(createMockRequest('/', 'fr', 'http://ca.example.com:3000'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://ca.example.com:3000/fr'
      );
    });

    it('uses the correct port and protocol when behind a proxy', () => {
      middleware(
        createMockRequest('/', 'fr', 'http://192.168.0.1:3000', undefined, {
          'x-forwarded-host': 'ca.example.com',
          'x-forwarded-proto': 'https'
        })
      );
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'https://ca.example.com/fr'
      );

      middleware(
        createMockRequest('/', 'fr', 'http://192.168.0.1:3000', undefined, {
          'x-forwarded-host': 'ca.example.com',
          'x-forwarded-port': '4200',
          'x-forwarded-proto': 'https'
        })
      );
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[1][0].toString()).toBe(
        'https://ca.example.com:4200/fr'
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

    describe('base path', () => {
      it('redirects non-prefixed requests for the default locale', () => {
        middleware(
          withBasePath(createMockRequest('/', 'en', 'http://example.com'))
        );
        expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
          'http://example.com/base/en'
        );
      });
    });
  });
});
