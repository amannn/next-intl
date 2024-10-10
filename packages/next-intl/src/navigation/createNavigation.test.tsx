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
vi.mock('../../src/server/react-server/RequestLocale');

function mockCurrentLocale(locale: string) {
  // Enable synchronous rendering without having to suspend
  const localePromise = Promise.resolve(locale);
  (localePromise as any).status = 'fulfilled';
  (localePromise as any).value = locale;

  vi.mocked(getRequestLocale).mockImplementation(() => localePromise);

  vi.mocked(nextUseParams<{locale: string}>).mockImplementation(() => ({
    locale
  }));
}

function mockLocation(location: Partial<typeof window.location>) {
  delete (global.window as any).location;
  global.window ??= Object.create(window);
  (global.window as any).location = location;
}

beforeEach(() => {
  mockCurrentLocale('en');
  mockLocation({host: 'localhost:3000'});
});

const locales = ['en', 'de', 'ja'] as const;
const defaultLocale = 'en' as const;

const domains = [
  {
    defaultLocale: 'en',
    domain: 'example.com'
  },
  {
    defaultLocale: 'de',
    domain: 'example.de',
    locales: ['de', 'en']
  }
] satisfies DomainsConfig<typeof locales>;

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

      it('accepts search params', () => {
        const markup = renderToString(
          <Link href={{pathname: '/about', query: {foo: 'bar'}}}>About</Link>
        );
        expect(markup).toContain('href="/en/about?foo=bar"');
      });

      it('renders a prefix for a different locale', () => {
        // Being able to accept a string and not only a strictly typed locale is
        // important in order to be able to use a result from `useLocale()`.
        // This is less relevant for `Link`, but this should be in sync across
        // al navigation APIs (see https://github.com/amannn/next-intl/issues/1377)
        const locale = 'de' as string;

        const markup = renderToString(
          <Link href="/about" locale={locale}>
            Über uns
          </Link>
        );
        expect(markup).toContain('href="/de/about"');
        expect(markup).toContain('hrefLang="de"');
      });

      it('renders an object href with an external host', () => {
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

      it('does not allow to receive params', () => {
        <Link
          href={{
            pathname: '/news/[articleSlug]-[articleId]',
            // @ts-expect-error -- This error is important when switching from localized pathnames to shared pathnames
            params: {
              articleSlug: 'launch-party',
              articleId: 3
            }
          }}
        />;
      });
    });

    describe('getPathname', () => {
      it('can be called for the default locale', () => {
        // Being able to accept a string and not only a strictly typed locale is
        // important in order to be able to use a result from `useLocale()`.
        // This is less relevant for `Link`, but this should be in sync across
        // al navigation APIs (see https://github.com/amannn/next-intl/issues/1377)
        const locale = 'en' as string;

        expect(getPathname({href: '/unknown', locale})).toBe('/en/unknown');
      });

      it('can be called for a secondary locale', () => {
        expect(getPathname({locale: 'de', href: '/about'})).toBe('/de/about');
      });

      it('can incorporate search params', () => {
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

      it('does not allow to pass a domain', () => {
        // @ts-expect-error -- Domain is not supported
        getPathname({locale: 'en', href: '/', domain: 'example.com'});
      });

      it('does not accept the _forcePrefix flag', () => {
        getPathname(
          {locale: 'en', href: '/'},
          // @ts-expect-error -- Not supported
          true
        );
      });
    });

    describe.each([
      ['redirect', redirect, nextRedirect],
      ['permanentRedirect', permanentRedirect, nextPermanentRedirect]
    ])('%s', (_, redirectFn, nextRedirectFn) => {
      it('can redirect for the default locale', () => {
        const locale = 'en' as string;
        runInRender(() => redirectFn({href: '/', locale}));
        expect(nextRedirectFn).toHaveBeenLastCalledWith('/en');
      });

      it('forwards a redirect type', () => {
        runInRender(() =>
          redirectFn({href: '/', locale: 'en'}, RedirectType.push)
        );
        expect(nextRedirectFn).toHaveBeenLastCalledWith(
          '/en',
          RedirectType.push
        );
      });

      it('can redirect to a different locale', () => {
        runInRender(() => redirectFn({href: '/about', locale: 'de'}));
        expect(nextRedirectFn).toHaveBeenLastCalledWith('/de/about');
      });

      it('handles relative pathnames', () => {
        runInRender(() => redirectFn({href: 'about', locale: 'en'}));
        expect(nextRedirectFn).toHaveBeenLastCalledWith('about');
      });

      it('handles search params', () => {
        runInRender(() =>
          redirectFn({
            href: {pathname: '/about', query: {foo: 'bar'}},
            locale: 'en'
          })
        );
        expect(nextRedirectFn).toHaveBeenLastCalledWith('/en/about?foo=bar');
      });

      it('requires a locale', () => {
        // @ts-expect-error -- Object expected
        redirectFn('/');
        // @ts-expect-error -- Missing locale
        redirectFn({pathname: '/about'});
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
      it('can redirect for the default locale', () => {
        runInRender(() => redirectFn({href: '/', locale: 'en'}));
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

      it('handles relative pathnames', () => {
        // @ts-expect-error -- Validation is still on
        const markup = renderToString(<Link href="test">Test</Link>);
        expect(markup).toContain('href="test"');
      });

      it('handles unknown pathnames', () => {
        // @ts-expect-error -- Validation is still on
        const markup = renderToString(<Link href="/test">Test</Link>);
        expect(markup).toContain('href="/en/test"');
      });

      it('handles external links correctly', () => {
        const markup = renderToString(
          // @ts-expect-error -- Validation is still on
          <Link href="https://example.com/test">Test</Link>
        );
        expect(markup).toContain('href="https://example.com/test"');
      });

      it('restricts invalid usage', () => {
        // @ts-expect-error -- Unknown pathname
        <Link href="/unknown" />;
        // @ts-expect-error -- Missing params (this error is important when switching from shared pathnames to localized pathnames)
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
        runInRender(() => redirectFn({href: '/', locale: 'en'}));
        expect(nextRedirectFn).toHaveBeenLastCalledWith('/en');
      });

      it('can redirect with params and search params', () => {
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
            locale: 'en'
          })
        );
        expect(nextRedirectFn).toHaveBeenLastCalledWith(
          '/en/news/launch-party-3?foo=bar'
        );
      });

      it('can not be called with an arbitrary pathname', () => {
        // @ts-expect-error -- Unknown pathname
        runInRender(() => redirectFn({href: '/unknown', locale: 'en'}));
        // Works regardless
        expect(nextRedirectFn).toHaveBeenLastCalledWith('/en/unknown');
      });

      it('forwards a redirect type', () => {
        runInRender(() =>
          redirectFn({href: '/', locale: 'en'}, RedirectType.push)
        );
        expect(nextRedirectFn).toHaveBeenLastCalledWith(
          '/en',
          RedirectType.push
        );
      });

      it('can handle relative pathnames', () => {
        // @ts-expect-error -- Validation is still on
        runInRender(() => redirectFn({href: 'about', locale: 'en'}));
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
        runInRender(() => redirectFn({href: '/', locale: 'en'}));
        expect(nextRedirectFn).toHaveBeenLastCalledWith('/');
      });

      it('adds a prefix for a secondary locale', () => {
        runInRender(() => redirectFn({href: '/', locale: 'de'}));
        expect(nextRedirectFn).toHaveBeenLastCalledWith('/de');
      });

      it('forwards a redirect type', () => {
        runInRender(() =>
          redirectFn({href: '/', locale: 'en'}, RedirectType.push)
        );
        expect(nextRedirectFn).toHaveBeenLastCalledWith('/', RedirectType.push);
      });
    });
  });

  describe('localePrefix: "always", with `prefixes`', () => {
    const {Link, getPathname, permanentRedirect, redirect} = createNavigation({
      locales,
      defaultLocale,
      domains,
      localePrefix: {
        mode: 'always',
        prefixes: {
          en: '/us/en',
          de: '/eu/de'
          // (use /ja as-is)
        }
      }
    });

    describe('Link', () => {
      it('renders a prefix during SSR', () => {
        const markup = renderToString(<Link href="/about">About</Link>);
        expect(markup).toContain('href="/us/en/about"');
      });

      it('renders a prefix when currently on a secondary locale', () => {
        mockCurrentLocale('de');
        render(<Link href="/about">About</Link>);
        expect(
          screen.getByRole('link', {name: 'About'}).getAttribute('href')
        ).toBe('/eu/de/about');
      });
    });

    describe('getPathname', () => {
      it('adds a prefix for the default locale', () => {
        expect(getPathname({locale: 'en', href: '/about'})).toBe(
          '/us/en/about'
        );
      });

      it('adds a prefix for a secondary locale', () => {
        expect(getPathname({locale: 'de', href: '/about'})).toBe(
          '/eu/de/about'
        );
      });
    });

    describe.each([
      ['redirect', redirect, nextRedirect],
      ['permanentRedirect', permanentRedirect, nextPermanentRedirect]
    ])('%s', (_, redirectFn, nextRedirectFn) => {
      it('adds a prefix for the default locale', () => {
        runInRender(() => redirectFn({href: '/', locale: 'en'}));
        expect(nextRedirectFn).toHaveBeenLastCalledWith('/us/en');
      });

      it('adds a prefix for a secondary locale', () => {
        runInRender(() => redirectFn({href: '/about', locale: 'de'}));
        expect(nextRedirectFn).toHaveBeenLastCalledWith('/eu/de/about');
      });
    });
  });

  describe("localePrefix: 'always', with `domains`", () => {
    const {Link, getPathname, permanentRedirect, redirect} = createNavigation({
      locales,
      defaultLocale,
      domains,
      localePrefix: 'always'
    });

    describe('Link', () => {
      it('renders a prefix during SSR', () => {
        const markup = renderToString(<Link href="/about">About</Link>);
        expect(markup).toContain('href="/en/about"');
      });

      it('renders a prefix eventually on the client side', () => {
        mockLocation({host: 'example.com'});
        render(<Link href="/about">About</Link>);
        expect(
          screen.getByRole('link', {name: 'About'}).getAttribute('href')
        ).toBe('/en/about');
      });
    });

    describe('getPathname', () => {
      it('adds a prefix for the default locale without printing a warning', () => {
        const consoleSpy = vi.spyOn(console, 'error');
        expect(getPathname({locale: 'en', href: '/about'})).toBe('/en/about');
        expect(consoleSpy).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
      });
    });

    describe.each([
      ['redirect', redirect, nextRedirect],
      ['permanentRedirect', permanentRedirect, nextPermanentRedirect]
    ])('%s', (_, redirectFn, nextRedirectFn) => {
      it('adds a prefix for the default locale', () => {
        runInRender(() => redirectFn({href: '/', locale: 'en'}));
        expect(nextRedirectFn).toHaveBeenLastCalledWith('/en');
      });

      it('does not allow passing a domain', () => {
        runInRender(() =>
          redirectFn({
            href: '/',
            locale: 'en',
            // @ts-expect-error -- Domain is not allowed
            domain: 'example.com'
          })
        );
        expect(nextRedirectFn).toHaveBeenLastCalledWith('/en');
      });
    });
  });

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

      it('does not render a prefix eventually on the client side for the default locale of the given domain', () => {
        mockLocation({host: 'example.com'});
        render(<Link href="/about">About</Link>);
        expect(
          screen.getByRole('link', {name: 'About'}).getAttribute('href')
        ).toBe('/about');
      });

      it('renders a prefix when when linking to a secondary locale on an unknown domain', () => {
        mockLocation({host: 'localhost:3000'});
        render(
          <Link href="/about" locale="de">
            Über uns
          </Link>
        );
        expect(
          screen.getByRole('link', {name: 'Über uns'}).getAttribute('href')
        ).toBe('/de/about');
      });

      it('renders a prefix when currently on a secondary locale', () => {
        mockLocation({host: 'example.de'});
        mockCurrentLocale('en');
        render(<Link href="/about">About</Link>);
        expect(
          screen.getByRole('link', {name: 'About'}).getAttribute('href')
        ).toBe('/en/about');
      });

      it('does not render a prefix when currently on a domain with a different default locale', () => {
        mockLocation({host: 'example.de'});
        mockCurrentLocale('de');
        render(<Link href="/about">About</Link>);
        expect(
          screen.getByRole('link', {name: 'About'}).getAttribute('href')
        ).toBe('/about');
      });

      it('renders a prefix when currently on a secondary locale and linking to the default locale', () => {
        mockLocation({host: 'example.de'});
        mockCurrentLocale('en');
        const markup = renderToString(
          <Link href="/about" locale="de">
            About
          </Link>
        );
        expect(markup).toContain('href="/de/about"');
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
        const consoleSpy = vi.spyOn(console, 'error');
        // @ts-expect-error -- Domain is not provided
        getPathname({locale: 'de', href: '/about'});
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });
    });

    describe.each([
      ['redirect', redirect, nextRedirect],
      ['permanentRedirect', permanentRedirect, nextPermanentRedirect]
    ])('%s', (_, redirectFn, nextRedirectFn) => {
      it('adds a prefix even for the default locale', () => {
        // (see comment in source for reasoning)
        runInRender(() => redirectFn({href: '/', locale: 'en'}));
        expect(nextRedirectFn).toHaveBeenLastCalledWith('/en');
      });

      it('does not add a prefix when domain is provided for the default locale', () => {
        runInRender(() =>
          redirectFn({href: '/', locale: 'en', domain: 'example.com'})
        );
        expect(nextRedirectFn).toHaveBeenLastCalledWith('/');
      });

      it('adds a prefix for a secondary locale', () => {
        runInRender(() => redirectFn({href: '/', locale: 'de'}));
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
        runInRender(() => redirectFn({href: '/', locale: 'en'}));
        expect(nextRedirectFn).toHaveBeenLastCalledWith('/');
      });

      it('forwards a redirect type', () => {
        runInRender(() =>
          redirectFn({href: '/', locale: 'en'}, RedirectType.push)
        );
        expect(nextRedirectFn).toHaveBeenLastCalledWith('/', RedirectType.push);
      });
    });
  });

  describe("localePrefix: 'never', with `domains`", () => {
    const {Link, getPathname, permanentRedirect, redirect} = createNavigation({
      locales,
      defaultLocale,
      domains,
      localePrefix: 'never'
    });

    describe('Link', () => {
      it('renders no prefix during SSR', () => {
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

      it('can link to a pathname on another domain', () => {
        const markup = renderToString(
          <Link href={{pathname: '/about', host: 'example.de'}} locale="de">
            Über uns
          </Link>
        );
        expect(markup).toContain('href="//example.de/about"');
        expect(markup).toContain('hrefLang="de"');
      });
    });

    describe('getPathname', () => {
      it('does not add a prefix for the default locale', () => {
        const originalConsoleError = console.error;
        console.error = vi.fn();
        expect(getPathname({locale: 'en', href: '/about'})).toBe('/about');
        expect(console.error).not.toHaveBeenCalled();
        console.error = originalConsoleError;
      });
    });

    describe.each([
      ['redirect', redirect, nextRedirect],
      ['permanentRedirect', permanentRedirect, nextPermanentRedirect]
    ])('%s', (_, redirectFn, nextRedirectFn) => {
      it('adds no prefix for the default locale', () => {
        runInRender(() => redirectFn({href: '/', locale: 'en'}));
        expect(nextRedirectFn).toHaveBeenLastCalledWith('/');
      });
    });
  });
});
