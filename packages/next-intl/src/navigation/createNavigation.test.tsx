import {render, screen} from '@testing-library/react';
import {
  RedirectType,
  redirect as nextRedirect,
  permanentRedirect as nextPermanentRedirect
} from 'next/navigation';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {it, describe, vi, expect, beforeEach} from 'vitest';
import {defineRouting, Pathnames} from '../routing';
import {getRequestLocale} from '../server/react-server/RequestLocale';
import {getLocalePrefix} from '../shared/utils';
import createNavigation from './react-server/createNavigation';
import BaseLink from './shared/BaseLink';

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useParams: vi.fn(() => ({locale: 'en'})),
    usePathname: vi.fn(() => '/'),
    redirect: vi.fn(),
    permanentRedirect: vi.fn()
  };
});

vi.mock('next-intl/config', () => ({
  default: async () =>
    ((await vi.importActual('../../src/server')) as any).getRequestConfig({
      locale: 'en'
    })
}));

vi.mock('react');

// Avoids handling an async component (not supported by renderToString)
vi.mock('../../src/navigation/react-server/ServerLink', () => ({
  default({locale, localePrefix, ...rest}: any) {
    const finalLocale = locale || 'en';
    const prefix = getLocalePrefix(finalLocale, localePrefix);
    return (
      <BaseLink
        locale={finalLocale}
        localePrefixMode={localePrefix.mode}
        prefix={prefix}
        {...rest}
      />
    );
  }
}));

vi.mock('../../src/server/react-server/RequestLocale', () => ({
  getRequestLocale: vi.fn(() => 'en')
}));

beforeEach(() => {
  vi.mocked(getRequestLocale).mockImplementation(() => 'en');
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

function runInRender(cb: () => void) {
  function Component() {
    cb();
    return null;
  }
  render(<Component />);
}

describe("localePrefix: 'always'", () => {
  const {Link, getPathname, permanentRedirect, redirect} = createNavigation({
    locales,
    defaultLocale,
    localePrefix: 'always'
  });

  describe('Link', () => {
    it('renders a prefix for the default locale', () => {
      const markup = renderToString(<Link href="/about">About</Link>);
      expect(markup).toContain('href="/en/about"');
    });

    it('accepts query params', () => {
      const markup = renderToString(
        <Link href={{pathname: '/about', query: {foo: 'bar'}}}>About</Link>
      );
      expect(markup).toContain('href="/en/about?foo=bar"');
    });

    it('renders a prefix for a different locale', () => {
      const markup = renderToString(
        <Link href="/about" locale="de">
          Über uns
        </Link>
      );
      expect(markup).toContain('href="/de/about"');
    });

    it('renders an object href', () => {
      render(
        <Link
          href={{pathname: '/about', query: {foo: 'bar'}, host: 'www.test.de'}}
        >
          About
        </Link>
      );
      expect(
        screen.getByRole('link', {name: 'About'}).getAttribute('href')
      ).toBe('//www.test.de/about?foo=bar');
    });

    it('handles params', () => {
      render(
        <Link href="/news/launch-party-3" locale="de">
          About
        </Link>
      );
      expect(
        screen.getByRole('link', {name: 'About'}).getAttribute('href')
      ).toBe('/de/news/launch-party-3');
    });

    it('handles relative links correctly on the initial render', () => {
      const markup = renderToString(<Link href="test">Test</Link>);
      expect(markup).toContain('href="test"');
    });

    it('does not allow to use unknown locales', () => {
      const markup = renderToString(
        // @ts-expect-error -- Unknown locale
        <Link href="/about" locale="zh">
          Unknown
        </Link>
      );
      // Still works
      expect(markup).toContain('href="/zh/about"');
    });
  });

  describe('getPathname', () => {
    it('can be called with an arbitrary pathname', () => {
      expect(getPathname('/unknown')).toBe('/en/unknown');
    });

    it('can switch the locale while providing an `href`', () => {
      expect(
        getPathname({
          href: '/about',
          locale: 'de'
        })
      ).toBe('/de/about');
    });

    it('requires a locale when using an object href', () => {
      // @ts-expect-error -- Missing locale
      expect(getPathname({href: '/about'}))
        // Still works
        .toBe('/en/about');
    });
  });

  describe.each([
    ['redirect', redirect, nextRedirect],
    ['permanentRedirect', permanentRedirect, nextPermanentRedirect]
  ])('%s', (_, redirectFn, nextRedirectFn) => {
    it('can redirect for the default locale', () => {
      runInRender(() => redirectFn('/'));
      expect(nextRedirectFn).toHaveBeenLastCalledWith('/en');
    });

    it('forwards a redirect type', () => {
      runInRender(() => redirectFn('/', RedirectType.push));
      expect(nextRedirectFn).toHaveBeenLastCalledWith('/en', RedirectType.push);
    });

    it('can redirect for a different locale', () => {
      runInRender(() => redirectFn({href: '/about', locale: 'de'}));
      expect(nextRedirectFn).toHaveBeenLastCalledWith('/de/about');
    });
  });
});

describe("localePrefix: 'always', no `locales`", () => {
  const {Link, getPathname, permanentRedirect, redirect} = createNavigation({
    localePrefix: 'always'
  });

  describe('createNavigation', () => {
    it('can create navigation APIs with no arguments at all', () => {
      createNavigation();
    });

    it('can not be used with `pathnames`', () => {
      // @ts-expect-error -- Missing locales
      createNavigation({pathnames});
    });
  });

  describe('Link', () => {
    it('renders a prefix for the current locale', () => {
      const markup = renderToString(<Link href="/about">About</Link>);
      expect(markup).toContain('href="/en/about"');
    });

    it('renders a prefix for a different locale', () => {
      const markup = renderToString(
        <Link href="/about" locale="zh">
          About
        </Link>
      );
      expect(markup).toContain('href="/zh/about"');
    });

    it('handles relative links correctly on the initial render', () => {
      const markup = renderToString(<Link href="test">Test</Link>);
      expect(markup).toContain('href="test"');
    });
  });

  describe('getPathname', () => {
    it('adds a prefix for the current locale', () => {
      expect(getPathname('/about')).toBe('/en/about');
    });

    it('adds a prefix for a different locale', () => {
      expect(getPathname({href: '/about', locale: 'zh'})).toBe('/zh/about');
    });
  });

  describe.each([
    ['redirect', redirect, nextRedirect],
    ['permanentRedirect', permanentRedirect, nextPermanentRedirect]
  ])('%s', (_, redirectFn, nextRedirectFn) => {
    it('can redirect for the current locale', () => {
      runInRender(() => redirectFn('/'));
      expect(nextRedirectFn).toHaveBeenLastCalledWith('/en');
    });

    it('can redirect for a different locale', () => {
      runInRender(() => redirectFn({href: '/about', locale: 'de'}));
      expect(nextRedirectFn).toHaveBeenLastCalledWith('/de/about');
    });
  });
});

describe("localePrefix: 'always', with `pathnames`", () => {
  const {Link, getPathname, permanentRedirect, redirect} = createNavigation({
    locales,
    defaultLocale,
    localePrefix: 'always',
    pathnames
  });

  describe('createNavigation', () => {
    it('requires `locales` for `pathnames`', () => {
      // @ts-expect-error -- Missing locales
      createNavigation({
        pathnames: {'/': '/'}
      });
    });

    it('can be called with a `routing` object', () => {
      createNavigation(
        defineRouting({
          locales: ['en', 'de'],
          defaultLocale: 'en'
        })
      );
      createNavigation(
        defineRouting({
          locales: ['en', 'de'],
          defaultLocale: 'en',
          pathnames: {
            home: '/',
            about: {
              en: '/about',
              de: '/ueber-uns'
            }
          }
        })
      );
    });
  });

  describe('Link', () => {
    it('renders a prefix for the default locale', () => {
      const markup = renderToString(<Link href="/about">About</Link>);
      expect(markup).toContain('href="/en/about"');
    });

    it('renders a prefix for a different locale', () => {
      const markup = renderToString(
        <Link href="/about" locale="de">
          Über uns
        </Link>
      );
      expect(markup).toContain('href="/de/ueber-uns"');
    });

    it('renders an object href', () => {
      render(
        <Link href={{pathname: '/about', query: {foo: 'bar'}}}>About</Link>
      );
      expect(
        screen.getByRole('link', {name: 'About'}).getAttribute('href')
      ).toBe('/about?foo=bar');
    });

    it('handles params', () => {
      render(
        <Link
          href={{
            pathname: '/news/[articleSlug]-[articleId]',
            params: {
              articleId: 3,
              articleSlug: 'launch-party'
            }
          }}
          locale="de"
        >
          About
        </Link>
      );
      expect(
        screen.getByRole('link', {name: 'About'}).getAttribute('href')
      ).toBe('/de/neuigkeiten/launch-party-3');
    });

    it('restricts invalid usage', () => {
      // @ts-expect-error -- Unknown locale
      <Link href="/about" locale="zh" />;
      // @ts-expect-error -- Unknown pathname
      <Link href="/unknown" />;
      // @ts-expect-error -- Missing params
      <Link href={{pathname: '/news/[articleSlug]-[articleId]'}} />;
    });
  });

  describe('getPathname', () => {
    it('can be called with a known pathname', () => {
      expect(getPathname('/about')).toBe('/en/about');
      expect(getPathname({pathname: '/about', query: {foo: 'bar'}})).toBe(
        '/en/about?foo=bar'
      );
    });

    it('can resolve a pathname with params for the current locale via a short-hand', () => {
      expect(
        getPathname({
          pathname: '/news/[articleSlug]-[articleId]',
          params: {
            articleId: 3,
            articleSlug: 'launch-party'
          },
          query: {foo: 'bar'}
        })
      ).toBe('/en/news/launch-party-3?foo=bar');
    });

    it('can switch the locale while providing an `href`', () => {
      expect(
        getPathname({
          href: {
            pathname: '/news/[articleSlug]-[articleId]',
            params: {
              articleId: 3,
              articleSlug: 'launch-party'
            },
            query: {foo: 'bar'}
          },
          locale: 'de'
        })
      ).toBe('/de/neuigkeiten/launch-party-3?foo=bar');
    });

    it('can not be called with an arbitrary pathname', () => {
      // @ts-expect-error -- Unknown pathname
      expect(getPathname('/unknown')).toBe('/en/unknown');
    });
  });

  describe.each([
    ['redirect', redirect, nextRedirect],
    ['permanentRedirect', permanentRedirect, nextPermanentRedirect]
  ])('%s', (_, redirectFn, nextRedirectFn) => {
    it('can redirect for the default locale', () => {
      runInRender(() => redirectFn('/'));
      expect(nextRedirectFn).toHaveBeenLastCalledWith('/en');
    });

    it('can redirect with params', () => {
      runInRender(() =>
        redirectFn({
          pathname: '/news/[articleSlug]-[articleId]',
          params: {
            articleId: 3,
            articleSlug: 'launch-party'
          },
          query: {foo: 'bar'}
        })
      );
      expect(nextRedirectFn).toHaveBeenLastCalledWith(
        '/en/news/launch-party-3?foo=bar'
      );
    });

    it('can redirect for a different locale', () => {
      runInRender(() => redirectFn({href: '/about', locale: 'de'}));
      expect(nextRedirectFn).toHaveBeenLastCalledWith('/de/ueber-uns');
    });

    it('can redirect for a different locale with params', () => {
      runInRender(() =>
        redirectFn({
          href: {
            pathname: '/news/[articleSlug]-[articleId]',
            params: {
              articleId: 3,
              articleSlug: 'launch-party'
            },
            query: {foo: 'bar'}
          },
          locale: 'de'
        })
      );
      expect(nextRedirectFn).toHaveBeenLastCalledWith(
        '/de/neuigkeiten/launch-party-3?foo=bar'
      );
    });

    it('can not be called with an arbitrary pathname', () => {
      // @ts-expect-error -- Unknown pathname
      runInRender(() => redirectFn('/unknown'));
      expect(nextRedirectFn).toHaveBeenLastCalledWith('/en/unknown');
    });

    it('forwards a redirect type', () => {
      runInRender(() => redirectFn('/', RedirectType.push));
      expect(nextRedirectFn).toHaveBeenLastCalledWith('/en', RedirectType.push);
    });
  });
});

describe("localePrefix: 'as-needed'", () => {
  const {getPathname, permanentRedirect, redirect} = createNavigation({
    locales,
    defaultLocale,
    localePrefix: 'as-needed'
  });

  // describe.todo('Link', () => {
  //   // nooope. but only if we are already on that locale? for cookie switching
  //   // maybe:
  //   // - initial render without locale (correct link)
  //   // - add locale on client side to switch cookie?
  //   it.only('renders a prefix for the default locale', () => {
  //     const markup = renderToString(<Link href="/about">About</Link>);
  //     expect(markup).toContain('href="/en/about"');
  //   });

  //   it('renders a prefix for a different locale', () => {
  //     const markup = renderToString(
  //       <Link href="/about" locale="de">
  //         Über uns
  //       </Link>
  //     );
  //     expect(markup).toContain('href="/de/about"');
  //   });

  //   it('renders an object href', () => {
  //     render(
  //       <Link href={{pathname: '/about', query: {foo: 'bar'}}}>About</Link>
  //     );
  //     expect(
  //       screen.getByRole('link', {name: 'About'}).getAttribute('href')
  //     ).toBe('/about?foo=bar');
  //   });

  //   it('handles params', () => {
  //     render(
  //       <Link href="/news/launch-party-3" locale="de">
  //         About
  //       </Link>
  //     );
  //     expect(
  //       screen.getByRole('link', {name: 'About'}).getAttribute('href')
  //     ).toBe('/de/news/launch-party-3');
  //   });

  //   it('handles relative links correctly on the initial render', () => {
  //     const markup = renderToString(<Link href="test">Test</Link>);
  //     expect(markup).toContain('href="test"');
  //   });
  // });

  describe('getPathname', () => {
    it('does not add a prefix when the current locale is the default locale', () => {
      expect(getPathname('/unknown')).toBe('/unknown');
    });

    it('adds a prefix for a secondary locale', () => {
      expect(
        getPathname({
          href: '/about',
          locale: 'de'
        })
      ).toBe('/de/about');
    });

    it('requires a locale when using an object href', () => {
      // @ts-expect-error -- Missing locale
      expect(getPathname({href: '/about'}))
        // Still works
        .toBe('/about');
    });

    it('does not add a prefix for the default locale', () => {
      expect(getPathname({href: '/about', locale: 'en'})).toBe('/about');
    });
  });

  describe.each([
    ['redirect', redirect, nextRedirect],
    ['permanentRedirect', permanentRedirect, nextPermanentRedirect]
  ])('%s', (_, redirectFn, nextRedirectFn) => {
    it('does not add a prefix when redirecting within the default locale', () => {
      runInRender(() => redirectFn('/'));
      expect(nextRedirectFn).toHaveBeenLastCalledWith('/');
    });

    it('forwards a redirect type', () => {
      runInRender(() => redirectFn('/', RedirectType.push));
      expect(nextRedirectFn).toHaveBeenLastCalledWith('/', RedirectType.push);
    });

    it('adds a prefix when redirecting to a secondary locale', () => {
      runInRender(() => redirectFn({href: '/about', locale: 'de'}));
      expect(nextRedirectFn).toHaveBeenLastCalledWith('/de/about');
    });

    it('adds a prefix when redirecting from a different locale to the default locale', () => {
      vi.mocked(getRequestLocale).mockImplementation(() => 'de');
      runInRender(() => redirectFn({href: '/about', locale: 'en'}));
      expect(nextRedirectFn).toHaveBeenLastCalledWith('/en/about');
    });
  });
});

// describe("localePrefix: 'always', with `prefixes`", () => {})
// describe("localePrefix: 'as-needed', no `locales`", () => {})
// describe("localePrefix: 'as-needed', with `domains`", () => {})
// describe("localePrefix: 'never', with `domains`", () => {})
// describe("localePrefix: 'always', with `domains`", () => {})

describe("localePrefix: 'never'", () => {
  const {Link, getPathname, permanentRedirect, redirect} = createNavigation({
    locales,
    defaultLocale,
    localePrefix: 'never'
  });

  describe('Link', () => {
    it('renders no prefix for the default locale', () => {
      const markup = renderToString(<Link href="/about">About</Link>);
      expect(markup).toContain('href="/about"');
    });

    it('renders a prefix for a different locale', () => {
      const markup = renderToString(
        <Link href="/about" locale="de">
          Über uns
        </Link>
      );
      expect(markup).toContain('href="/de/about"');
    });
  });

  describe('getPathname', () => {
    it('does not add a prefix when staying on the current locale', () => {
      expect(getPathname('/unknown')).toBe('/unknown');
    });

    it('does not add a prefix when specifying a secondary locale', () => {
      expect(getPathname({href: '/about', locale: 'de'})).toBe('/about');
    });

    it('requires a locale when using an object href', () => {
      // @ts-expect-error -- Missing locale
      expect(getPathname({href: '/about'}))
        // Still works
        .toBe('/about');
    });
  });

  describe.each([
    ['redirect', redirect, nextRedirect],
    ['permanentRedirect', permanentRedirect, nextPermanentRedirect]
  ])('%s', (_, redirectFn, nextRedirectFn) => {
    it('can redirect for the default locale', () => {
      runInRender(() => redirectFn('/'));
      expect(nextRedirectFn).toHaveBeenLastCalledWith('/');
    });

    it('forwards a redirect type', () => {
      runInRender(() => redirectFn('/', RedirectType.push));
      expect(nextRedirectFn).toHaveBeenLastCalledWith('/', RedirectType.push);
    });

    it('can redirect for a different locale', () => {
      runInRender(() => redirectFn({href: '/about', locale: 'de'}));
      expect(nextRedirectFn).toHaveBeenLastCalledWith('/de/about');
    });
  });
});
