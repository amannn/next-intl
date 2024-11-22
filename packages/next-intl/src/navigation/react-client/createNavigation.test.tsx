import {fireEvent, render, screen} from '@testing-library/react';
import {PrefetchKind} from 'next/dist/client/components/router-reducer/router-reducer-types';
import {
  usePathname as useNextPathname,
  useRouter as useNextRouter,
  useParams
} from 'next/navigation';
import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {NextIntlClientProvider} from '../../react-client';
import {DomainsConfig, Pathnames} from '../../routing';
import createNavigation from './createNavigation';

vi.mock('next/navigation');

function mockCurrentLocale(locale: string) {
  vi.mocked(useParams<{locale: string}>).mockImplementation(() => ({
    locale
  }));
}

function mockLocation(
  location: Partial<typeof window.location>,
  basePath?: string
) {
  delete (global.window as any).location;
  global.window = Object.create(window);
  (global.window as any).location = location;

  if (location.pathname) {
    const pathname = basePath
      ? location.pathname.replace(basePath, '')
      : location.pathname;
    vi.mocked(useNextPathname).mockReturnValue(pathname);
  }
}

beforeEach(() => {
  mockCurrentLocale('en');
  mockLocation({host: 'localhost:3000', pathname: '/en'});

  const router = {
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn()
  };
  vi.mocked(useNextRouter).mockImplementation(() => router);
});

const locales = ['en', 'de', 'ja'] as const;
const defaultLocale = 'en' as const;

const domains: DomainsConfig<typeof locales> = [
  {
    defaultLocale: 'en',
    domain: 'example.com'
  },
  {
    defaultLocale: 'de',
    domain: 'example.de',
    locales: ['de', 'en']
  }
];

const pathnames = {
  '/': '/',
  '/about': {
    en: '/about',
    de: '/ueber-uns',
    ja: '/約'
  },
  '/news/[articleSlug]-[articleId]': {
    en: '/news/[articleSlug]-[articleId]',
    de: '/neuigkeiten/[articleSlug]-[articleId]',
    ja: '/ニュース/[articleSlug]-[articleId]'
  },
  '/categories/[...parts]': {
    en: '/categories/[...parts]',
    de: '/kategorien/[...parts]',
    ja: '/カテゴリ/[...parts]'
  },
  '/catch-all/[[...parts]]': '/catch-all/[[...parts]]'
} satisfies Pathnames<typeof locales>;

function getRenderPathname<Return extends string>(usePathname: () => Return) {
  return () => {
    function Component() {
      return usePathname();
    }
    render(<Component />);
  };
}

function getInvokeRouter<Router>(useRouter: () => Router) {
  return function invokeRouter(cb: (router: Router) => void) {
    function Component() {
      const router = useRouter();
      cb(router);
      return null;
    }
    render(<Component />);
  };
}

describe("localePrefix: 'always'", () => {
  const {Link, usePathname, useRouter} = createNavigation({
    locales,
    defaultLocale,
    localePrefix: 'always'
  });

  describe('Link', () => {
    describe('usage outside of Next.js', () => {
      beforeEach(() => {
        vi.mocked(useParams<any>).mockImplementation((() => null) as any);
      });

      it('works with a provider', () => {
        render(
          <NextIntlClientProvider locale="en">
            <Link href="/test">Test</Link>
          </NextIntlClientProvider>
        );
        expect(
          screen.getByRole('link', {name: 'Test'}).getAttribute('href')
        ).toBe('/en/test');
      });

      it('throws without a provider', () => {
        expect(() => render(<Link href="/test">Test</Link>)).toThrow(
          'No intl context found. Have you configured the provider?'
        );
      });
    });

    it('can receive a ref', () => {
      let ref;

      render(
        <Link
          ref={(node) => {
            ref = node;
          }}
          href="/test"
        >
          Test
        </Link>
      );

      expect(ref).toBeDefined();
    });
  });

  describe('useRouter', () => {
    const invokeRouter = getInvokeRouter(useRouter);

    it('leaves unrelated router functionality in place', () => {
      (['back', 'forward', 'refresh'] as const).forEach((method) => {
        invokeRouter((router) => router[method]());
        expect(useNextRouter()[method]).toHaveBeenCalled();
      });
    });

    describe.each(['push', 'replace'] as const)('`%s`', (method) => {
      it('prefixes with the default locale', () => {
        invokeRouter((router) => router[method]('/about'));
        expect(useNextRouter()[method]).toHaveBeenCalledWith('/en/about');
      });

      it('prefixes with a secondary locale', () => {
        // Being able to accept a string and not only a strictly typed locale is
        // important in order to be able to use a result from `useLocale()`.
        // This is less relevant for `Link`, but this should be in sync across
        // al navigation APIs (see https://github.com/amannn/next-intl/issues/1377)
        const locale = 'de' as string;

        invokeRouter((router) => router[method]('/about', {locale}));
        expect(useNextRouter()[method]).toHaveBeenCalledWith('/de/about');
      });

      it('passes through unknown options to the Next.js router', () => {
        invokeRouter((router) => router[method]('/about', {scroll: true}));
        expect(useNextRouter()[method]).toHaveBeenCalledWith('/en/about', {
          scroll: true
        });
      });

      it('handles search params via a final string', () => {
        invokeRouter((router) => router[method]('/test?foo=bar'));
        expect(useNextRouter()[method]).toHaveBeenCalledWith(
          '/en/test?foo=bar'
        );
      });

      it('handles search params via an object', () => {
        invokeRouter((router) =>
          router[method]({
            pathname: '/test',
            query: {foo: 'bar'}
          })
        );
        expect(useNextRouter()[method]).toHaveBeenCalledWith(
          '/en/test?foo=bar'
        );
      });

      it('passes through absolute urls', () => {
        invokeRouter((router) => router[method]('https://example.com'));
        expect(useNextRouter()[method]).toHaveBeenCalledWith(
          'https://example.com'
        );
      });

      it('passes through relative urls', () => {
        invokeRouter((router) => router[method]('about'));
        expect(useNextRouter()[method]).toHaveBeenCalledWith('about');
      });
    });

    describe('prefetch', () => {
      it('prefixes with the default locale', () => {
        invokeRouter((router) => router.prefetch('/about'));
        expect(useNextRouter().prefetch).toHaveBeenCalledWith('/en/about');
      });

      it('prefixes with a secondary locale', () => {
        invokeRouter((router) =>
          router.prefetch('/about', {locale: 'de', kind: PrefetchKind.FULL})
        );
        expect(useNextRouter().prefetch).toHaveBeenCalledWith('/de/about', {
          kind: 'full'
        });
      });
    });
  });

  describe('usePathname', () => {
    const renderPathname = getRenderPathname(usePathname);

    it('returns the correct pathname for the default locale', () => {
      mockCurrentLocale('en');
      mockLocation({pathname: '/en/about'});

      renderPathname();
      screen.getByText('/about');
    });

    it('returns the correct pathname for a secondary locale', () => {
      mockCurrentLocale('de');
      mockLocation({pathname: '/de/about'});

      renderPathname();
      screen.getByText('/about');
    });
  });
});

describe("localePrefix: 'always', with `localeCookie`", () => {
  const {Link, useRouter} = createNavigation({
    locales,
    defaultLocale,
    localePrefix: 'always',
    localeCookie: {
      maxAge: 60,
      domain: 'example.com',
      sameSite: 'strict',
      partitioned: true,
      path: '/nested',
      priority: 'high',
      secure: true
    }
  });

  describe('Link', () => {
    it('uses the provided cookie options', () => {
      global.document.cookie = 'NEXT_LOCALE=en';
      const cookieSpy = vi.spyOn(global.document, 'cookie', 'set');

      render(
        <Link href="/" locale="de">
          Test
        </Link>
      );
      fireEvent.click(screen.getByRole('link', {name: 'Test'}));

      expect(cookieSpy).toHaveBeenCalledWith(
        [
          'NEXT_LOCALE=de',
          'max-age=60',
          'sameSite=strict',
          'domain=example.com',
          'partitioned',
          'path=/nested',
          'priority=high',
          'secure'
        ].join(';') + ';'
      );
      cookieSpy.mockRestore();
    });
  });

  describe('useRouter', () => {
    const invokeRouter = getInvokeRouter(useRouter);

    it('uses the provided cookie options', () => {
      const cookieSpy = vi.spyOn(global.document, 'cookie', 'set');

      invokeRouter((router) => router.push('/about', {locale: 'de'}));

      expect(cookieSpy).toHaveBeenCalledWith(
        [
          'NEXT_LOCALE=de',
          'max-age=60',
          'sameSite=strict',
          'domain=example.com',
          'partitioned',
          'path=/nested',
          'priority=high',
          'secure'
        ].join(';') + ';'
      );
      cookieSpy.mockRestore();
    });
  });
});

describe("localePrefix: 'always', with `basePath`", () => {
  const {useRouter} = createNavigation({
    locales,
    defaultLocale,
    localePrefix: 'always'
  });

  beforeEach(() => {
    mockLocation({pathname: '/base/path/en'}, '/base/path');
  });

  describe('useRouter', () => {
    const invokeRouter = getInvokeRouter(useRouter);

    it('can push', () => {
      invokeRouter((router) => router.push('/test'));
      expect(useNextRouter().push).toHaveBeenCalledWith('/en/test');
    });

    it('can replace', () => {
      invokeRouter((router) => router.replace('/test'));
      expect(useNextRouter().replace).toHaveBeenCalledWith('/en/test');
    });

    it('can prefetch', () => {
      invokeRouter((router) => router.prefetch('/test'));
      expect(useNextRouter().prefetch).toHaveBeenCalledWith('/en/test');
    });

    it('sets the right cookie', () => {
      const cookieSpy = vi.spyOn(global.document, 'cookie', 'set');
      invokeRouter((router) => router.push('/about', {locale: 'de'}));

      expect(cookieSpy).toHaveBeenCalledWith(
        [
          'NEXT_LOCALE=de',
          'max-age=31536000',
          'sameSite=lax',
          'path=/base/path'
        ].join(';') + ';'
      );
      cookieSpy.mockRestore();
    });
  });
});

describe("localePrefix: 'always', with `pathnames`", () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {usePathname, useRouter} = createNavigation({
    locales,
    defaultLocale,
    localePrefix: 'always',
    pathnames
  });

  describe('useRouter', () => {
    const invokeRouter = getInvokeRouter(useRouter);

    describe.each(['push', 'replace'] as const)('`%s`', (method) => {
      it('localizes a pathname for the default locale', () => {
        invokeRouter((router) => router[method]('/about'));
        expect(useNextRouter()[method]).toHaveBeenCalledWith('/en/about');
      });

      it('localizes a pathname for a secondary locale', () => {
        invokeRouter((router) => router[method]('/about', {locale: 'de'}));
        expect(useNextRouter()[method]).toHaveBeenCalledWith('/de/ueber-uns');
      });

      it('handles pathname params', () => {
        invokeRouter((router) =>
          router[method]({
            pathname: '/news/[articleSlug]-[articleId]',
            params: {
              articleSlug: 'launch-party',
              articleId: '3'
            }
          })
        );
        expect(useNextRouter()[method]).toHaveBeenCalledWith(
          '/en/news/launch-party-3'
        );
      });

      it('handles search params', () => {
        invokeRouter((router) =>
          router[method]({
            pathname: '/about',
            query: {
              foo: 'bar'
            }
          })
        );
        expect(useNextRouter()[method]).toHaveBeenCalledWith(
          '/en/about?foo=bar'
        );
      });

      it('disallows unknown pathnames', () => {
        // @ts-expect-error -- Unknown pathname
        invokeRouter((router) => router[method]('/unknown'));

        // Still works
        expect(useNextRouter()[method]).toHaveBeenCalledWith('/en/unknown');
      });
    });
  });

  describe('usePathname', () => {
    it('returns a typed pathname', () => {
      type Return = ReturnType<typeof usePathname>;

      '/about' satisfies Return;
      '/categories/[...parts]' satisfies Return;

      // @ts-expect-error
      '/unknown' satisfies Return;
    });
  });
});

describe("localePrefix: 'always', custom `prefixes`", () => {
  const {usePathname} = createNavigation({
    locales,
    localePrefix: {
      mode: 'always',
      prefixes: {
        en: '/uk'
      }
    }
  });
  const renderPathname = getRenderPathname(usePathname);

  describe('usePathname', () => {
    it('returns the correct pathname for a custom locale prefix', () => {
      mockCurrentLocale('en');
      mockLocation({pathname: '/uk/about'});
      renderPathname();
      screen.getByText('/about');
    });

    // https://github.com/vercel/next.js/issues/73085
    it('is tolerant when a locale is used in the pathname', () => {
      mockCurrentLocale('en');
      mockLocation({pathname: '/en/about'});
      renderPathname();
      screen.getByText('/about');
    });
  });
});

describe("localePrefix: 'as-needed'", () => {
  const {usePathname, useRouter} = createNavigation({
    locales,
    defaultLocale,
    localePrefix: 'as-needed'
  });

  function renderPathname() {
    function Component() {
      return usePathname();
    }
    render(<Component />);
  }

  describe('useRouter', () => {
    const invokeRouter = getInvokeRouter(useRouter);

    it('leaves unrelated router functionality in place', () => {
      (['back', 'forward', 'refresh'] as const).forEach((method) => {
        invokeRouter((router) => router[method]());
        expect(useNextRouter()[method]).toHaveBeenCalled();
      });
    });

    describe.each(['push', 'replace'] as const)('`%s`', (method) => {
      it('does not prefix the default locale', () => {
        invokeRouter((router) => router[method]('/about'));
        expect(useNextRouter()[method]).toHaveBeenCalledWith('/about');
      });

      it('prefixes a secondary locale', () => {
        invokeRouter((router) => router[method]('/about', {locale: 'de'}));
        expect(useNextRouter()[method]).toHaveBeenCalledWith('/de/about');
      });

      it('does not prefix the default locale when being switched to', () => {
        invokeRouter((router) => router[method]('/about', {locale: 'en'}));
        expect(useNextRouter()[method]).toHaveBeenCalledWith('/about');
      });
    });

    describe('prefetch', () => {
      it('does not prefix with the default locale', () => {
        invokeRouter((router) => router.prefetch('/about'));
        expect(useNextRouter().prefetch).toHaveBeenCalledWith('/about');
      });

      it('prefixes with a secondary locale', () => {
        invokeRouter((router) => router.prefetch('/about', {locale: 'de'}));
        expect(useNextRouter().prefetch).toHaveBeenCalledWith('/de/about');
      });
    });
  });

  describe('usePathname', () => {
    it('returns the correct pathname for the default locale', () => {
      mockCurrentLocale('en');
      mockLocation({pathname: '/about'});

      renderPathname();
      screen.getByText('/about');
    });

    it('returns the correct pathname for a secondary locale', () => {
      mockCurrentLocale('de');
      mockLocation({pathname: '/de/about'});

      renderPathname();
      screen.getByText('/about');
    });
  });
});

describe("localePrefix: 'as-needed', with `basePath` and `domains`", () => {
  const {useRouter} = createNavigation({
    locales,
    defaultLocale,
    domains,
    localePrefix: 'as-needed'
  });

  describe('useRouter', () => {
    const invokeRouter = getInvokeRouter(useRouter);

    describe('example.com, defaultLocale: "en"', () => {
      beforeEach(() => {
        mockLocation(
          {pathname: '/base/path/about', host: 'example.com'},
          '/base/path'
        );
      });

      it('can compute the correct pathname when the default locale on the current domain matches the current locale', () => {
        invokeRouter((router) => router.push('/test'));
        expect(useNextRouter().push).toHaveBeenCalledWith('/test');
      });

      it('can compute the correct pathname when the default locale on the current domain does not match the current locale', () => {
        invokeRouter((router) => router.push('/test', {locale: 'de'}));
        expect(useNextRouter().push).toHaveBeenCalledWith('/de/test');
      });
    });

    describe('example.de, defaultLocale: "de"', () => {
      beforeEach(() => {
        mockCurrentLocale('de');
        mockLocation(
          {pathname: '/base/path/about', host: 'example.de'},
          '/base/path'
        );
      });

      it('can compute the correct pathname when the default locale on the current domain matches the current locale', () => {
        invokeRouter((router) => router.push('/test'));
        expect(useNextRouter().push).toHaveBeenCalledWith('/test');
      });

      it('can compute the correct pathname when the default locale on the current domain does not match the current locale', () => {
        invokeRouter((router) => router.push('/test', {locale: 'en'}));
        expect(useNextRouter().push).toHaveBeenCalledWith('/en/test');
      });
    });
  });
});

describe("localePrefix: 'as-needed', with `domains`", () => {
  const {usePathname, useRouter} = createNavigation({
    locales,
    defaultLocale,
    domains,
    localePrefix: 'as-needed'
  });

  describe('useRouter', () => {
    const invokeRouter = getInvokeRouter(useRouter);

    describe.each(['push', 'replace'] as const)('`%s`', (method) => {
      it('does not prefix the default locale when on a domain with a matching defaultLocale', () => {
        mockCurrentLocale('en');
        mockLocation({pathname: '/about', host: 'example.com'});
        invokeRouter((router) => router[method]('/about'));
        expect(useNextRouter()[method]).toHaveBeenCalledWith('/about');
      });

      it('does not prefix the default locale when on a domain with a different defaultLocale', () => {
        mockCurrentLocale('de');
        mockLocation({pathname: '/about', host: 'example.de'});
        invokeRouter((router) => router[method]('/about'));
        expect(useNextRouter()[method]).toHaveBeenCalledWith('/about');
      });

      it('does not prefix the default locale when on an unknown domain', () => {
        const consoleSpy = vi.spyOn(console, 'error');
        mockCurrentLocale('en');
        mockLocation({pathname: '/about', host: 'localhost:3000'});
        invokeRouter((router) => router[method]('/about'));
        expect(useNextRouter()[method]).toHaveBeenCalledWith('/about');
        expect(consoleSpy).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
      });

      it('prefixes the default locale when on a domain with a different defaultLocale', () => {
        mockCurrentLocale('de');
        mockLocation({pathname: '/about', host: 'example.de'});
        invokeRouter((router) => router[method]('/about', {locale: 'en'}));
        expect(useNextRouter()[method]).toHaveBeenCalledWith('/en/about');
      });
    });
  });

  const renderPathname = getRenderPathname(usePathname);

  describe('usePathname', () => {
    it('returns the correct pathname for the default locale', () => {
      mockCurrentLocale('en');
      mockLocation({pathname: '/about', host: 'example.com'});
      renderPathname();
      screen.getByText('/about');
    });

    it('returns the correct pathname for a secondary locale', () => {
      mockCurrentLocale('de');
      mockLocation({pathname: '/de/about', host: 'example.com'});
      renderPathname();
      screen.getByText('/about');
    });

    it('returns the correct pathname for the default locale on a domain with a different defaultLocale', () => {
      mockCurrentLocale('de');
      mockLocation({pathname: '/about', host: 'example.de'});
      renderPathname();
      screen.getByText('/about');
    });

    it('returns the correct pathname for a secondary locale on a domain with a different defaultLocale', () => {
      mockCurrentLocale('en');
      mockLocation({pathname: '/en/about', host: 'example.de'});
      renderPathname();
      screen.getByText('/about');
    });
  });
});

describe("localePrefix: 'never'", () => {
  const {Link, usePathname, useRouter} = createNavigation({
    locales,
    defaultLocale,
    localePrefix: 'never'
  });

  function renderPathname() {
    function Component() {
      return usePathname();
    }
    render(<Component />);
  }

  describe('Link', () => {
    it('keeps the cookie value in sync', () => {
      global.document.cookie = 'NEXT_LOCALE=en';
      render(
        <Link href="/" locale="de">
          Test
        </Link>
      );
      expect(document.cookie).toContain('NEXT_LOCALE=en');
      fireEvent.click(screen.getByRole('link', {name: 'Test'}));
      expect(document.cookie).toContain('NEXT_LOCALE=de');
    });

    it('updates the href when the query changes', () => {
      const {rerender} = render(<Link href={{pathname: '/'}}>Test</Link>);
      expect(
        screen.getByRole('link', {name: 'Test'}).getAttribute('href')
      ).toBe('/');
      rerender(<Link href={{pathname: '/', query: {foo: 'bar'}}}>Test</Link>);
      expect(
        screen.getByRole('link', {name: 'Test'}).getAttribute('href')
      ).toBe('/?foo=bar');
    });
  });

  describe('useRouter', () => {
    const invokeRouter = getInvokeRouter(useRouter);

    it('leaves unrelated router functionality in place', () => {
      (['back', 'forward', 'refresh'] as const).forEach((method) => {
        invokeRouter((router) => router[method]());
        expect(useNextRouter()[method]).toHaveBeenCalled();
      });
    });

    describe.each(['push', 'replace'] as const)('`%s`', (method) => {
      it('does not prefix the default locale', () => {
        invokeRouter((router) => router[method]('/about'));
        expect(useNextRouter()[method]).toHaveBeenCalledWith('/about');
      });

      it('does not prefix a secondary locale', () => {
        invokeRouter((router) => router[method]('/about', {locale: 'de'}));
        expect(useNextRouter()[method]).toHaveBeenCalledWith('/about');
      });
    });

    it('keeps the cookie value in sync', () => {
      document.cookie = 'NEXT_LOCALE=en';

      invokeRouter((router) => router.push('/about', {locale: 'de'}));
      expect(document.cookie).toContain('NEXT_LOCALE=de');

      invokeRouter((router) => router.push('/test'));
      expect(document.cookie).toContain('NEXT_LOCALE=de');

      invokeRouter((router) => router.replace('/about', {locale: 'de'}));
      expect(document.cookie).toContain('NEXT_LOCALE=de');

      invokeRouter((router) =>
        router.prefetch('/about', {locale: 'ja', kind: PrefetchKind.AUTO})
      );
      expect(document.cookie).toContain('NEXT_LOCALE=ja');
    });

    describe('prefetch', () => {
      it('does not prefix the default locale', () => {
        invokeRouter((router) => router.prefetch('/about'));
        expect(useNextRouter().prefetch).toHaveBeenCalledWith('/about');
      });

      it('does not prefix a secondary locale', () => {
        invokeRouter((router) => router.prefetch('/about', {locale: 'de'}));
        expect(useNextRouter().prefetch).toHaveBeenCalledWith('/about');
      });
    });
  });

  describe('usePathname', () => {
    it('returns the correct pathname for the default locale', () => {
      mockCurrentLocale('en');
      mockLocation({pathname: '/about'});

      renderPathname();
      screen.getByText('/about');
    });

    it('returns the correct pathname for a secondary locale', () => {
      mockCurrentLocale('de');
      mockLocation({pathname: '/about'});

      renderPathname();
      screen.getByText('/about');
    });
  });
});

describe("localePrefix: 'never', with `basePath`", () => {
  const {useRouter} = createNavigation({
    locales,
    defaultLocale,
    localePrefix: 'never'
  });

  beforeEach(() => {
    mockLocation({pathname: '/base/path/en'}, '/base/path');
  });

  describe('useRouter', () => {
    const invokeRouter = getInvokeRouter(useRouter);

    it('can push', () => {
      invokeRouter((router) => router.push('/test'));
      expect(useNextRouter().push).toHaveBeenCalledWith('/test');
    });

    it('can replace', () => {
      invokeRouter((router) => router.replace('/test'));
      expect(useNextRouter().replace).toHaveBeenCalledWith('/test');
    });

    it('can prefetch', () => {
      invokeRouter((router) => router.prefetch('/test'));
      expect(useNextRouter().prefetch).toHaveBeenCalledWith('/test');
    });
  });
});
