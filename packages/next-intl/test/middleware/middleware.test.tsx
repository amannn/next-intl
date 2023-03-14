import {RequestCookies} from 'next/dist/compiled/@edge-runtime/cookies';
import {NextRequest, NextResponse} from 'next/server';
import createIntlMiddleware from '../../src/middleware';

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
  locale: 'en' | 'de' = 'en',
  host = 'http://localhost:3000'
) {
  const headers = new Headers({
    'accept-language':
      locale === 'en' ? 'en-US,en;q=0.9,de;q=0.8' : 'de-DE,de;q=0.9,en;q=0.8',
    host: new URL(host).host
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
        ? pathnameWithSearch.split('?')[1]
        : ''
    }
  } as NextRequest;
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

describe('type: prefix', () => {
  describe('prefix: as-needed', () => {
    const middleware = createIntlMiddleware({
      defaultLocale: 'en',
      locales: ['en', 'de']
    }) as (request: NextRequest) => MockResponse;

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
  });

  describe('prefix: always', () => {
    const middleware = createIntlMiddleware({
      defaultLocale: 'en',
      locales: ['en', 'de'],
      routing: {
        type: 'prefix',
        prefix: 'always'
      }
    }) as (request: NextRequest) => MockResponse;

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

describe('type: domain', () => {
  const middleware = createIntlMiddleware({
    defaultLocale: 'en',
    locales: ['en', 'de'],
    routing: {
      type: 'domain',
      domains: [
        {locale: 'en', domain: 'en.example.com'},
        {locale: 'de', domain: 'de.example.com'}
      ]
    }
  }) as (request: NextRequest) => MockResponse;

  it('serves requests for matching locales at the root', () => {
    middleware(createMockRequest('/', 'en', 'http://en.example.com'));
    expect(MockedNextResponse.next).not.toHaveBeenCalled();
    expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
    expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
      'http://en.example.com/en'
    );
  });

  it('serves requests for matching locales at nested paths', () => {
    middleware(createMockRequest('/about', 'en', 'http://en.example.com'));
    expect(MockedNextResponse.next).not.toHaveBeenCalled();
    expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
    expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
      'http://en.example.com/en/about'
    );
  });

  it('serves requests for not matching locales at the root', () => {
    middleware(createMockRequest('/', 'de', 'http://en.example.com'));
    expect(MockedNextResponse.next).not.toHaveBeenCalled();
    expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
    expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
      'http://en.example.com/en'
    );
  });

  it('serves requests for not matching locales at nested paths', () => {
    middleware(createMockRequest('/about', 'de', 'http://en.example.com'));
    expect(MockedNextResponse.next).not.toHaveBeenCalled();
    expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
    expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
      'http://en.example.com/en/about'
    );
  });

  it('serves requests for matching locales at unknown hosts', () => {
    middleware(createMockRequest('/', 'en', 'http://localhost:3000'));
    expect(MockedNextResponse.next).not.toHaveBeenCalled();
    expect(MockedNextResponse.redirect).not.toHaveBeenCalled();
    expect(MockedNextResponse.rewrite.mock.calls[0][0].toString()).toBe(
      'http://localhost:3000/en'
    );
  });

  describe('redirects for locale prefixes', () => {
    it('redirects for the locale root when the locale matches', () => {
      middleware(createMockRequest('/en/about', 'en', 'http://en.example.com'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://en.example.com/about'
      );
    });

    it('redirects for sub paths when the locale matches', () => {
      middleware(createMockRequest('/en/about', 'en', 'http://en.example.com'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://en.example.com/about'
      );
    });

    it("redirects for the locale root when the locale doesn't match", () => {
      middleware(createMockRequest('/de/about', 'de', 'http://en.example.com'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://de.example.com/about'
      );
    });

    it("redirects for sub paths when the locale doesn't match", () => {
      middleware(createMockRequest('/de/about', 'de', 'http://en.example.com'));
      expect(MockedNextResponse.next).not.toHaveBeenCalled();
      expect(MockedNextResponse.rewrite).not.toHaveBeenCalled();
      expect(MockedNextResponse.redirect.mock.calls[0][0].toString()).toBe(
        'http://de.example.com/about'
      );
    });
  });
});

describe('deprecated domain config', () => {
  const middleware = createIntlMiddleware({
    defaultLocale: 'en',
    locales: ['en', 'de'],
    domains: [
      {
        defaultLocale: 'en',
        domain: 'en.example.com'
      },
      {
        defaultLocale: 'de',
        domain: 'de.example.com'
      }
    ]
  }) as (request: NextRequest) => MockResponse;

  it('accepts deprecated config', () => {
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
