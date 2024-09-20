import {render, screen} from '@testing-library/react';
import {
  RedirectType,
  redirect as nextRedirect,
  permanentRedirect as nextPermanentRedirect,
  useParams as nextUseParams
} from 'next/navigation';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {it, describe, vi, expect, beforeEach} from 'vitest';
import {defineRouting, DomainsConfig, Pathnames} from '../routing';
import {getRequestLocale} from '../server/react-server/RequestLocale';
import createNavigationClient from './react-client/createNavigation';
import createNavigationServer from './react-server/createNavigation';

vi.mock('react');
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useParams: vi.fn(() => ({locale: 'en'})),
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
vi.mock('../../src/server/react-server/RequestLocale', () => ({
  getRequestLocale: vi.fn(() => 'en')
}));

function mockCurrentLocale(locale: string) {
  vi.mocked(getRequestLocale).mockImplementation(() => locale);
  vi.mocked(nextUseParams<{locale: string}>).mockImplementation(() => ({
    locale
  }));
}

beforeEach(() => {
  mockCurrentLocale('en');
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

function runInRender(cb: () => void) {
  function Component() {
    cb();
    return null;
  }
  render(<Component />);
}

describe.each([
  {
    env: 'react-client',
    implementation: createNavigationClient
  },
  {
    env: 'react-server',
    implementation: createNavigationServer
  }
])('createNavigation ($env)', ({implementation: createNavigation}) => {
  describe("localePrefix: 'always'", () => {
    const {Link, getPathname, permanentRedirect, redirect} = createNavigation({
      locales,
      defaultLocale,
      localePrefix: 'always'
    });

    describe('Link', () => {
      it('renders a prefix when currently on the default locale', () => {
        const markup = renderToString(<Link href="/about">About</Link>);
        expect(markup).toContain('href="/en/about"');
      });

      it('renders a prefix when currently on a secondary locale', () => {
        mockCurrentLocale('de');
        const markup = renderToString(<Link href="/about">About</Link>);
        expect(markup).toContain('href="/de/about"');
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
        expect(markup).toContain('hrefLang="de"');
      });

      it('renders an object href', () => {
        render(
          <Link
            href={{
              pathname: '/about',
              query: {foo: 'bar'},
              host: 'www.test.de'
            }}
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

      it('handles relative links correctly', () => {
        const markup = renderToString(<Link href="test">Test</Link>);
        expect(markup).toContain('href="test"');
      });

      it('handles external links correctly', () => {
        const markup = renderToString(
          <Link href="https://example.com/test">Test</Link>
        );
        expect(markup).toContain('href="https://example.com/test"');
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
      it('can be called for the default locale', () => {
        expect(getPathname({href: '/unknown', locale: 'en'})).toBe(
          '/en/unknown'
        );
      });

      it('can be called for a secondary locale', () => {
        expect(getPathname({locale: 'de', href: '/about'})).toBe('/de/about');
      });

      it('can incorporate query params', () => {
        expect(
          getPathname({
            href: {
              pathname: '/about',
              query: {foo: 'bar'}
            },
            locale: 'en'
          })
        ).toBe('/en/about?foo=bar');
      });

      it('does not accept `query` on the root', () => {
        // eslint-disable-next-line no-unused-expressions
        () =>
          getPathname({
            href: '/about',
            locale: 'en',
            // @ts-expect-error -- Not allowed
            query: {foo: 'bar'}
          });
      });

      it('does not accept `params` on href', () => {
        // eslint-disable-next-line no-unused-expressions
        () =>
          getPathname({
            href: {
              pathname: '/users/[userId]',
              // @ts-expect-error -- Not allowed
              params: {userId: 3}
            },
            locale: 'en'
          });
      });

      it('requires a locale', () => {
        // Some background: This function can be used either in the `react-server`
        // or the `react-client` environment. Since the function signature doesn't
        // impose a limit on where it can be called (e.g. during rendering), we
        // can't determine the current locale in the `react-client` environment.
        // While we could theoretically retrieve the current locale in the
        // `react-server` environment we need a shared function signature that
        // works in either environment.

        // @ts-expect-error -- Missing locale
        // eslint-disable-next-line no-unused-expressions
        () => getPathname({href: '/about'});
      });

      it('handles relative pathnames', () => {
        // Not really useful, but we silently support this
        expect(getPathname({locale: 'en', href: 'about'})).toBe('about');
      });

      it('handles external pathnames', () => {
        // Not really useful, but we silently support this
        expect(
          getPathname({locale: 'en', href: 'https://example.com/about'})
        ).toBe('https://example.com/about');
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
        expect(nextRedirectFn).toHaveBeenLastCalledWith(
          '/en',
          RedirectType.push
        );
      });

      // There's nothing strictly against this, but there was no need for this so
      // far. The API design is a bit tricky since Next.js uses the second argument
      // for a plain `type` string. Should we support an object here? Also consider
      // API symmetry with `router.push`.
      it('can not redirect for a different locale', () => {
        // @ts-expect-error
        // eslint-disable-next-line no-unused-expressions
        () => redirectFn('/about', {locale: 'de'});
      });

      it('handles relative pathnames', () => {
        runInRender(() => redirectFn('about'));
        expect(nextRedirectFn).toHaveBeenLastCalledWith('about');
      });

      it('handles query params', () => {
        runInRender(() =>
          redirectFn({pathname: '/about', query: {foo: 'bar'}})
        );
        expect(nextRedirectFn).toHaveBeenLastCalledWith('/en/about?foo=bar');
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
    });

    describe('getPathname', () => {
      it('adds a prefix for the default locale', () => {
        expect(getPathname({href: '/about', locale: 'en'})).toBe('/en/about');
      });

      it('adds a prefix for a secondary locale', () => {
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
      it('renders a prefix when currently on the default locale', () => {
        const markup = renderToString(<Link href="/about">About</Link>);
        expect(markup).toContain('href="/en/about"');
      });

      it('renders a prefix when currently on a secondary locale', () => {
        mockCurrentLocale('de');
        const markup = renderToString(<Link href="/about">About</Link>);
        expect(markup).toContain('href="/de/ueber-uns"');
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
        ).toBe('/en/about?foo=bar');
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

      it('handles relative links', () => {
        // @ts-expect-error -- Validation is still on
        const markup = renderToString(<Link href="test">Test</Link>);
        expect(markup).toContain('href="test"');
      });

      it('handles external links correctly', () => {
        const markup = renderToString(
          // @ts-expect-error -- Validation is still on
          <Link href="https://example.com/test">Test</Link>
        );
        expect(markup).toContain('href="https://example.com/test"');
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
        expect(getPathname({href: '/about', locale: 'en'})).toBe('/en/about');
        expect(
          getPathname({
            href: {pathname: '/about', query: {foo: 'bar'}},
            locale: 'en'
          })
        ).toBe('/en/about?foo=bar');
      });

      it('can resolve a pathname with params', () => {
        expect(
          getPathname({
            locale: 'en',
            href: {
              pathname: '/news/[articleSlug]-[articleId]',
              params: {
                articleId: 3,
                articleSlug: 'launch-party'
              },
              query: {foo: 'bar'}
            }
          })
        ).toBe('/en/news/launch-party-3?foo=bar');
      });

      it('can not be called with an arbitrary pathname', () => {
        // @ts-expect-error -- Unknown pathname
        expect(getPathname({locale: 'en', href: '/unknown'}))
          // Works regardless
          .toBe('/en/unknown');
      });

      it('handles relative pathnames', () => {
        // @ts-expect-error -- Validation is still on
        expect(getPathname({locale: 'en', href: 'about'})).toBe('about');
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

      it('can redirect with params and query params', () => {
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

      it('can not be called with an arbitrary pathname', () => {
        // @ts-expect-error -- Unknown pathname
        runInRender(() => redirectFn('/unknown'));
        // Works regardless
        expect(nextRedirectFn).toHaveBeenLastCalledWith('/en/unknown');
      });

      it('forwards a redirect type', () => {
        runInRender(() => redirectFn('/', RedirectType.push));
        expect(nextRedirectFn).toHaveBeenLastCalledWith(
          '/en',
          RedirectType.push
        );
      });

      it('can handle relative pathnames', () => {
        // @ts-expect-error -- Validation is still on
        runInRender(() => redirectFn('about'));
        expect(nextRedirectFn).toHaveBeenLastCalledWith('about');
      });
    });
  });

  describe("localePrefix: 'as-needed'", () => {
    const {Link, getPathname, permanentRedirect, redirect} = createNavigation({
      locales,
      defaultLocale,
      localePrefix: 'as-needed'
    });

    describe('createNavigation', () => {
      it('errors when no `defaultLocale` is set', () => {
        expect(
          () => void createNavigation({localePrefix: 'as-needed'})
        ).toThrowError(
          "`localePrefix: 'as-needed' requires a `defaultLocale`."
        );
      });
    });

    describe('Link', () => {
      it('does not render a prefix when currently on the default locale', () => {
        const markup = renderToString(<Link href="/about">About</Link>);
        expect(markup).toContain('href="/about"');
      });

      it('renders a prefix when currently on a secondary locale', () => {
        mockCurrentLocale('de');
        const markup = renderToString(<Link href="/about">About</Link>);
        expect(markup).toContain('href="/de/about"');
      });

      it('renders a prefix for a different locale', () => {
        const markup = renderToString(
          <Link href="/about" locale="de">
            Über uns
          </Link>
        );
        expect(markup).toContain('href="/de/about"');
      });

      it('renders a prefix when currently on a secondary locale and linking to the default locale', () => {
        mockCurrentLocale('de');
        const markup = renderToString(
          <Link href="/about" locale="en">
            About
          </Link>
        );
        expect(markup).toContain('href="/en/about"');
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

      it('does not accept `params`', () => {
        <Link
          href={{
            pathname: '/news/[articleSlug]-[articleId]',
            // @ts-expect-error -- Not allowed
            params: {
              articleId: 3,
              articleSlug: 'launch-party'
            }
          }}
        />;
      });
    });

    describe('getPathname', () => {
      it('does not add a prefix for the default locale', () => {
        expect(getPathname({locale: 'en', href: '/about'})).toBe('/about');
      });

      it('adds a prefix for a secondary locale', () => {
        expect(getPathname({locale: 'de', href: '/about'})).toBe('/de/about');
      });

      it('requires a locale', () => {
        // @ts-expect-error -- Missing locale
        // eslint-disable-next-line no-unused-expressions
        () => getPathname({href: '/about'});
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

      it('adds a prefix when currently on a secondary locale', () => {
        mockCurrentLocale('de');
        runInRender(() => redirectFn('/'));
        expect(nextRedirectFn).toHaveBeenLastCalledWith('/de');
      });

      it('forwards a redirect type', () => {
        runInRender(() => redirectFn('/', RedirectType.push));
        expect(nextRedirectFn).toHaveBeenLastCalledWith('/', RedirectType.push);
      });
    });
  });

  // describe("localePrefix: 'always', with `prefixes`", () => {})
  // describe("localePrefix: 'as-needed', no `locales`", () => {})
  // describe("localePrefix: 'as-needed', with `domains`", () => {})
  // describe("localePrefix: 'never', with `domains`", () => {})
  // describe("localePrefix: 'always', with `domains`", () => {})
  describe("localePrefix: 'as-needed', with `domains`", () => {
    const {Link, getPathname, permanentRedirect, redirect} = createNavigation({
      locales,
      defaultLocale,
      domains,
      localePrefix: 'as-needed'
    });

    describe('Link', () => {
      it('renders a prefix during SSR even for the default locale', () => {
        // (see comment in source for reasoning)
        const markup = renderToString(<Link href="/about">About</Link>);
        expect(markup).toContain('href="/en/about"');
      });

    });

    describe('getPathname', () => {
      it('does not add a prefix for the default locale', () => {
        expect(
          getPathname({locale: 'en', href: '/about', domain: 'example.com'})
        ).toBe('/about');
        expect(
          getPathname({locale: 'de', href: '/about', domain: 'example.de'})
        ).toBe('/about');
      });

      it('adds a prefix for a secondary locale', () => {
        expect(
          getPathname({locale: 'de', href: '/about', domain: 'example.com'})
        ).toBe('/de/about');
        expect(
          getPathname({locale: 'en', href: '/about', domain: 'example.de'})
        ).toBe('/en/about');
      });

      it('prints a warning when no domain is provided', () => {
        const originalConsoleError = globalThis.console.error;
        globalThis.console.error = vi.fn();
        getPathname({locale: 'de', href: '/about'});
        expect(globalThis.console.error).toHaveBeenCalledWith(
          "You're using a routing configuration with `localePrefix: 'as-needed'` in combination with `domains`. In order to compute a correct pathname, you need to provide a `domain` parameter."
        );
        globalThis.console.error = originalConsoleError;
      });

      it('prints a warning when an unknown domain is provided', () => {
        const originalConsoleError = globalThis.console.error;
        globalThis.console.error = vi.fn();
        getPathname({locale: 'de', href: '/about', domain: 'example.org'});
        expect(globalThis.console.error).toHaveBeenCalledWith(
          'Domain "example.org" not found in the routing configuration. Available domains: example.com, example.de'
        );
        globalThis.console.error = originalConsoleError;
      });
    });

    describe.each([
      ['redirect', redirect, nextRedirect],
      ['permanentRedirect', permanentRedirect, nextPermanentRedirect]
    ])('%s', (_, redirectFn, nextRedirectFn) => {
      it('adds a prefix even for the default locale', () => {
        // (see comment in source for reasoning)
        runInRender(() => redirectFn('/'));
        expect(nextRedirectFn).toHaveBeenLastCalledWith('/en');
      });

      it('adds a prefix when currently on a secondary locale', () => {
        mockCurrentLocale('de');
        runInRender(() => redirectFn('/'));
        expect(nextRedirectFn).toHaveBeenLastCalledWith('/de');
      });
    });
  });

  describe("localePrefix: 'never'", () => {
    const {Link, getPathname, permanentRedirect, redirect} = createNavigation({
      locales,
      defaultLocale,
      localePrefix: 'never'
    });

    describe('Link', () => {
      it('renders no prefix when currently on the default locale', () => {
        const markup = renderToString(<Link href="/about">About</Link>);
        expect(markup).toContain('href="/about"');
      });

      it('renders no prefix when currently on a secondary locale', () => {
        mockCurrentLocale('de');
        const markup = renderToString(<Link href="/about">About</Link>);
        expect(markup).toContain('href="/about"');
      });

      it('renders a prefix when linking to a secondary locale', () => {
        const markup = renderToString(
          <Link href="/about" locale="de">
            Über uns
          </Link>
        );
        expect(markup).toContain('href="/de/about"');
        expect(markup).toContain('hrefLang="de"');
      });

      it('renders a prefix when currently on a secondary locale and linking to the default locale', () => {
        mockCurrentLocale('de');
        const markup = renderToString(
          <Link href="/about" locale="en">
            About
          </Link>
        );
        expect(markup).toContain('href="/en/about"');
      });
    });

    describe('getPathname', () => {
      it('does not add a prefix for the default locale', () => {
        expect(getPathname({locale: 'en', href: '/unknown'})).toBe('/unknown');
      });

      it('does not add a prefix for a secondary locale', () => {
        expect(getPathname({locale: 'de', href: '/about'})).toBe('/about');
      });

      it('requires a locale', () => {
        // @ts-expect-error -- Missing locale
        // eslint-disable-next-line no-unused-expressions
        () => getPathname({href: '/about'});
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
    });
  });
});
