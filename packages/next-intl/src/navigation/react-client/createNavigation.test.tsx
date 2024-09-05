import {render, screen} from '@testing-library/react';
import {useParams, usePathname as useNextPathname} from 'next/navigation';
import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {NextIntlClientProvider} from '../../react-client';
import {Pathnames} from '../../routing';
import createNavigation from './createNavigation';

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useParams: vi.fn(() => ({locale: 'en'})),
    usePathname: vi.fn(() => '/')
  };
});

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
  mockCurrentLocale('/en');
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

describe("localePrefix: 'always'", () => {
  const {Link, usePathname} = createNavigation({
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
  const {usePathname} = createNavigation({
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
  const {usePathname} = createNavigation({
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
