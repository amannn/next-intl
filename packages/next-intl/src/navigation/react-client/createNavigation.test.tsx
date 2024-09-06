import {fireEvent, render, screen} from '@testing-library/react';
import {
  useParams,
  usePathname as useNextPathname,
  useRouter as useNextRouter
} from 'next/navigation';
import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {NextIntlClientProvider} from '../../react-client';
import {Pathnames} from '../../routing';
import createNavigation from './createNavigation';

vi.mock('next/navigation');

function mockCurrentLocale(locale: string) {
  vi.mocked(useParams<{locale: string}>).mockImplementation(() => ({
    locale
  }));
}

function mockCurrentPathname(string: string) {
  vi.mocked(useNextPathname).mockImplementation(() => string);
}

beforeEach(() => {
  mockCurrentLocale('en');
  mockCurrentPathname('/en');

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
  const renderPathname = getRenderPathname(usePathname);

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
        invokeRouter((router) => router[method]('/about', {locale: 'de'}));
        expect(useNextRouter()[method]).toHaveBeenCalledWith('/de/about');
      });

      it('passes through unknown options to the Next.js router', () => {
        invokeRouter((router) => router[method]('/about', {scroll: true}));
        expect(useNextRouter()[method]).toHaveBeenCalledWith('/en/about', {
          scroll: true
        });
      });
    });

    describe('prefetch', () => {
      it('prefixes with the default locale', () => {
        invokeRouter((router) => router.prefetch('/about'));
        expect(useNextRouter().prefetch).toHaveBeenCalledWith('/en/about');
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
      mockCurrentPathname('/en/about');

      renderPathname();
      screen.getByText('/about');
    });

    it('returns the correct pathname for a secondary locale', () => {
      mockCurrentLocale('de');
      mockCurrentPathname('/de/about');

      renderPathname();
      screen.getByText('/about');
    });
  });
});

describe("localePrefix: 'always', with `pathnames`", () => {
  const {usePathname} = createNavigation({
    locales,
    defaultLocale,
    localePrefix: 'always',
    pathnames
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
      mockCurrentPathname('/uk/about');
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
    });

    describe('prefetch', () => {
      it('prefixes with the default locale', () => {
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
      mockCurrentPathname('/about');

      renderPathname();
      screen.getByText('/about');
    });

    it('returns the correct pathname for a secondary locale', () => {
      mockCurrentLocale('de');
      mockCurrentPathname('/de/about');

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
      mockCurrentPathname('/about');

      renderPathname();
      screen.getByText('/about');
    });

    it('returns the correct pathname for a secondary locale', () => {
      mockCurrentLocale('de');
      mockCurrentPathname('/about');

      renderPathname();
      screen.getByText('/about');
    });
  });
});
