import {RequestCookies} from 'next/dist/compiled/@edge-runtime/cookies';
import {NextRequest, NextResponse} from 'next/server';
import createIntlMiddleware from '../../src/middleware';
import {COOKIE_LOCALE_NAME} from '../../src/shared/constants';

type MockResponse = NextResponse & {
  args: Array<any>;
};

jest.mock('next/server', () => {
  const response = {
    headers: new Headers(),
    cookies: new RequestCookies(new Headers())
  };
  return {
    NextResponse: {
      next: jest.fn(() => response),
      rewrite: jest.fn(() => response),
      redirect: jest.fn(() => response)
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

function createMockMiddleware(
  ...args: Parameters<typeof createIntlMiddleware>
) {
  return createIntlMiddleware(...args) as (
    request: NextRequest
  ) => MockResponse;
}

const MockedNextResponse = NextResponse as unknown as {
  next: jest.Mock<typeof NextResponse>;
  rewrite: jest.Mock<typeof NextResponse>;
  redirect: jest.Mock<typeof NextResponse>;
};

beforeEach(() => {
  MockedNextResponse.next.mockClear();
  MockedNextResponse.rewrite.mockClear();
  MockedNextResponse.redirect.mockClear();
});

describe('prefix-based routing', () => {
  describe('localePrefix: as-needed', () => {
    const middleware = createMockMiddleware({
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
      expect(MockedNextResponse.next).toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
    });

    it('serves requests for other locales when prefixed with a trailing slash', () => {
      middleware(createMockRequest('/de/'));
      expect(MockedNextResponse.next).toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
    });

    it('serves requests for other locales with query params at the root', () => {
      middleware(createMockRequest('/de?sort=asc'));
      expect(MockedNextResponse.next).toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
    });

    it('serves requests for other locales with query params at a nested path', () => {
      middleware(createMockRequest('/de/list?sort=asc'));
      expect(MockedNextResponse.next).toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
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
        MockedNextResponse.rewrite.mock.calls[0][1].request.headers.get(
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
      expect(
        MockedNextResponse.next.mock.calls[0][0].request.headers.get('x-test')
      ).toBe('test');
    });
  });

  describe('localePrefix: as-needed, localeDetection: false', () => {
    const middleware = createMockMiddleware({
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
    const middleware = createMockMiddleware({
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
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.next).toHaveBeenCalled();
    });

    it('serves requests for non-default locales', () => {
      middleware(createMockRequest('/de'));
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.next).toHaveBeenCalled();
    });
  });
});

describe('domain-based routing', () => {
  describe('localePrefix: as-needed', () => {
    const middleware = createMockMiddleware({
      defaultLocale: 'en',
      locales: ['en', 'fr'],
      domains: [
        {defaultLocale: 'en', domain: 'en.example.com', locales: ['en']},
        {defaultLocale: 'en', domain: 'ca.example.com', locales: ['en', 'fr']},
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
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.next).toHaveBeenCalled();
    });

    it('serves requests for non-default locales at the locale root when the accept-language header points to the default locale', () => {
      middleware(createMockRequest('/fr', 'en', 'http://ca.example.com'));
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.next).toHaveBeenCalled();
    });

    it('serves requests for non-default locales at sub paths', () => {
      middleware(createMockRequest('/fr/about', 'fr', 'http://ca.example.com'));
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.next).toHaveBeenCalled();
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
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).toHaveBeenCalled();
      });

      it('serves requests for unknown hosts and non-default locales at sub paths', () => {
        middleware(createMockRequest('/fr/about', 'fr', 'http://localhost'));
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).toHaveBeenCalled();
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
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).toHaveBeenCalled();
      });

      it('serves requests for non-default locales at sub paths', () => {
        middleware(
          createMockRequest('/fr/about', 'fr', 'http://ca.example.com')
        );
        expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
        expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
        expect(MockedNextResponse.next).toHaveBeenCalled();
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
    const middleware = createMockMiddleware({
      defaultLocale: 'en',
      locales: ['en', 'fr'],
      localePrefix: 'always',
      domains: [
        {defaultLocale: 'en', domain: 'example.com', locales: ['en']},
        {defaultLocale: 'en', domain: 'ca.example.com', locales: ['en', 'fr']}
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
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.next).toHaveBeenCalledTimes(1);

      middleware(createMockRequest('/en/about', 'en', 'http://ca.example.com'));
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.next).toHaveBeenCalledTimes(2);
    });

    it('serves requests for non-default locales', () => {
      middleware(createMockRequest('/fr', 'fr', 'http://ca.example.com'));
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.next).toHaveBeenCalled();

      middleware(createMockRequest('/fr/about', 'fr', 'http://ca.example.com'));
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
      expect(MockedNextResponse.next).toHaveBeenCalledTimes(2);
    });
  });
});
