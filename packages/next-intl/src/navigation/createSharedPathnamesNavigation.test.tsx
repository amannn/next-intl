import {render, screen} from '@testing-library/react';
import {
  usePathname as useNextPathname,
  useParams,
  redirect as nextRedirect,
  permanentRedirect as nextPermanentRedirect,
  RedirectType
} from 'next/navigation';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {it, describe, vi, expect, beforeEach} from 'vitest';
import {getRequestLocale} from '../server/react-server/RequestLocale';
import {getLocalePrefix} from '../shared/utils';
import createSharedPathnamesNavigationClient from './react-client/createSharedPathnamesNavigation';
import createSharedPathnamesNavigationServer from './react-server/createSharedPathnamesNavigation';
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
  vi.mocked(useParams<any>).mockImplementation(() => ({locale: 'en'}));
});

const locales = ['en', 'de'] as const;
const localesWithCustomPrefixes = ['en', 'en-gb'] as const;
const customizedPrefixes = {
  'en-gb': '/uk'
};

describe.each([
  {env: 'react-client', implementation: createSharedPathnamesNavigationClient},
  {env: 'react-server', implementation: createSharedPathnamesNavigationServer}
])(
  'createSharedPathnamesNavigation ($env)',
  ({implementation: createSharedPathnamesNavigation}) => {
    describe("localePrefix: 'always'", () => {
      const {Link} = createSharedPathnamesNavigation({
        locales,
        localePrefix: 'always'
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
          expect(markup).toContain('href="/de/about"');
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
      });
    });

    describe("localePrefix: 'always', custom prefixes", () => {
      const {Link, redirect} = createSharedPathnamesNavigation({
        locales: localesWithCustomPrefixes,
        localePrefix: {
          mode: 'always',
          prefixes: customizedPrefixes
        }
      });

      describe('Link', () => {
        it('handles a locale without a custom prefix', () => {
          const markup = renderToString(<Link href="/about">About</Link>);
          expect(markup).toContain('href="/en/about"');
        });

        it('handles a locale with a custom prefix', () => {
          const markup = renderToString(
            <Link href="/about" locale="en-gb">
              Über uns
            </Link>
          );
          expect(markup).toContain('href="/uk/about"');
        });

        it('handles a locale with a custom prefix on an object href', () => {
          render(
            <Link
              href={{pathname: '/about', query: {foo: 'bar'}}}
              locale="en-gb"
            >
              About
            </Link>
          );
          expect(
            screen.getByRole('link', {name: 'About'}).getAttribute('href')
          ).toBe('/uk/about?foo=bar');
        });
      });

      describe('redirect', () => {
        function Component({href}: {href: string}) {
          redirect(href);
          return null;
        }

        it('can redirect for the default locale', () => {
          vi.mocked(useNextPathname).mockImplementation(() => '/');
          render(<Component href="/" />);
          expect(nextRedirect).toHaveBeenLastCalledWith('/en');
        });

        it('can redirect to a relative pathname', () => {
          vi.mocked(useNextPathname).mockImplementation(() => '/en/about');
          render(<Component href="test" />);
          expect(nextRedirect).toHaveBeenCalledWith('test');
        });

        it('can redirect for a non-default locale', () => {
          vi.mocked(useParams<any>).mockImplementation(() => ({
            locale: 'en-gb'
          }));
          vi.mocked(getRequestLocale).mockImplementation(() => 'en-gb');
          vi.mocked(useNextPathname).mockImplementation(() => '/');

          render(<Component href="/" />);
          expect(nextRedirect).toHaveBeenLastCalledWith('/uk');
        });
      });
    });

    describe("localePrefix: 'as-needed'", () => {
      const {Link, permanentRedirect, redirect} =
        createSharedPathnamesNavigation({
          locales,
          localePrefix: 'as-needed'
        });

      describe('Link', () => {
        it('renders a prefix for the default locale initially', () => {
          const markup = renderToString(<Link href="/about">About</Link>);
          expect(markup).toContain('href="/en/about"');
        });

        it("doesn't render a prefix for the default locale eventually", () => {
          render(<Link href="/about">Über uns</Link>);
          expect(screen.getByText('Über uns').getAttribute('href')).toBe(
            '/about'
          );
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

      describe('redirect', () => {
        function Component({href}: {href: string}) {
          redirect(href);
          return null;
        }

        it('can redirect for the default locale', () => {
          vi.mocked(useNextPathname).mockImplementation(() => '/');
          const {rerender} = render(<Component href="/" />);
          expect(nextRedirect).toHaveBeenLastCalledWith('/en');

          rerender(<Component href="/about" />);
          expect(nextRedirect).toHaveBeenLastCalledWith('/en/about');

          rerender(<Component href="/news/launch-party-3" />);
          expect(nextRedirect).toHaveBeenLastCalledWith(
            '/en/news/launch-party-3'
          );
        });

        it('can redirect for a non-default locale', () => {
          vi.mocked(useParams<any>).mockImplementation(() => ({locale: 'de'}));
          vi.mocked(getRequestLocale).mockImplementation(() => 'de');

          vi.mocked(useNextPathname).mockImplementation(() => '/');
          const {rerender} = render(<Component href="/" />);
          expect(nextRedirect).toHaveBeenLastCalledWith('/de');

          rerender(<Component href="/about" />);
          expect(nextRedirect).toHaveBeenLastCalledWith('/de/about');

          rerender(<Component href="/news/launch-party-3" />);
          expect(nextRedirect).toHaveBeenLastCalledWith(
            '/de/news/launch-party-3'
          );
        });

        it('supports optional search params', () => {
          vi.mocked(useNextPathname).mockImplementation(() => '/');
          render(<Component href="/?foo=bar&bar=1&bar=2" />);
          expect(nextRedirect).toHaveBeenLastCalledWith(
            '/en?foo=bar&bar=1&bar=2'
          );
        });

        it('can supply a type', () => {
          function Test() {
            redirect('/', RedirectType.push);
            return null;
          }
          render(<Test />);
          expect(nextRedirect).toHaveBeenLastCalledWith('/en', 'push');
        });
      });

      describe('permanentRedirect', () => {
        function Component({href}: {href: string}) {
          permanentRedirect(href);
          return null;
        }

        it('can permanently redirect for the default locale', () => {
          vi.mocked(useNextPathname).mockImplementation(() => '/');
          const {rerender} = render(<Component href="/" />);
          expect(nextPermanentRedirect).toHaveBeenLastCalledWith('/en');

          rerender(<Component href="/about" />);
          expect(nextPermanentRedirect).toHaveBeenLastCalledWith('/en/about');

          rerender(<Component href="/news/launch-party-3" />);
          expect(nextPermanentRedirect).toHaveBeenLastCalledWith(
            '/en/news/launch-party-3'
          );
        });

        it('can permanently redirect for a non-default locale', () => {
          vi.mocked(useParams<any>).mockImplementation(() => ({locale: 'de'}));
          vi.mocked(getRequestLocale).mockImplementation(() => 'de');

          vi.mocked(useNextPathname).mockImplementation(() => '/');
          const {rerender} = render(<Component href="/" />);
          expect(nextPermanentRedirect).toHaveBeenLastCalledWith('/de');

          rerender(<Component href="/about" />);
          expect(nextPermanentRedirect).toHaveBeenLastCalledWith('/de/about');

          rerender(<Component href="/news/launch-party-3" />);
          expect(nextPermanentRedirect).toHaveBeenLastCalledWith(
            '/de/news/launch-party-3'
          );
        });

        it('supports optional search params', () => {
          vi.mocked(useNextPathname).mockImplementation(() => '/');
          render(<Component href="/?foo=bar&bar=1&bar=2" />);
          expect(nextPermanentRedirect).toHaveBeenLastCalledWith(
            '/en?foo=bar&bar=1&bar=2'
          );
        });

        it('can supply a type', () => {
          function Test() {
            permanentRedirect('/', RedirectType.push);
            return null;
          }
          render(<Test />);
          expect(nextPermanentRedirect).toHaveBeenLastCalledWith('/en', 'push');
        });
      });
    });

    describe("localePrefix: 'as-needed', custom prefixes", () => {
      const {Link, permanentRedirect, redirect} =
        createSharedPathnamesNavigation({
          locales: localesWithCustomPrefixes,
          localePrefix: {mode: 'as-needed', prefixes: customizedPrefixes}
        });

      describe('Link', () => {
        it('renders a prefix for a locale with a custom prefix', () => {
          const markup = renderToString(
            <Link href="/about" locale="en-gb">
              About
            </Link>
          );
          expect(markup).toContain('href="/uk/about"');
        });
      });

      describe('redirect', () => {
        function Component({href}: {href: string}) {
          redirect(href);
          return null;
        }

        it('can redirect for a locale with a custom prefix', () => {
          vi.mocked(useParams<any>).mockImplementation(() => ({
            locale: 'en-gb'
          }));
          vi.mocked(getRequestLocale).mockImplementation(() => 'en-gb');

          vi.mocked(useNextPathname).mockImplementation(() => '/');
          const {rerender} = render(<Component href="/" />);
          expect(nextRedirect).toHaveBeenLastCalledWith('/uk');

          rerender(<Component href="/about" />);
          expect(nextRedirect).toHaveBeenLastCalledWith('/uk/about');
        });
      });

      describe('permanentRedirect', () => {
        function Component({href}: {href: string}) {
          permanentRedirect(href);
          return null;
        }

        it('can permanently redirect for a locale with a custom prefix', () => {
          vi.mocked(useParams<any>).mockImplementation(() => ({
            locale: 'en-gb'
          }));
          vi.mocked(getRequestLocale).mockImplementation(() => 'en-gb');

          vi.mocked(useNextPathname).mockImplementation(() => '/');
          const {rerender} = render(<Component href="/" />);
          expect(nextPermanentRedirect).toHaveBeenLastCalledWith('/uk');

          rerender(<Component href="/about" />);
          expect(nextPermanentRedirect).toHaveBeenLastCalledWith('/uk/about');
        });
      });
    });

    describe("localePrefix: 'never'", () => {
      const {Link, permanentRedirect, redirect} =
        createSharedPathnamesNavigation({
          locales,
          localePrefix: 'never'
        });

      describe('Link', () => {
        it("doesn't render a prefix for the default locale", () => {
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

      describe('redirect', () => {
        function Component({href}: {href: string}) {
          redirect(href);
          return null;
        }

        it('can redirect for the default locale', () => {
          vi.mocked(useNextPathname).mockImplementation(() => '/');
          const {rerender} = render(<Component href="/" />);
          expect(nextRedirect).toHaveBeenLastCalledWith('/');

          rerender(<Component href="/about" />);
          expect(nextRedirect).toHaveBeenLastCalledWith('/about');

          rerender(<Component href="/news/launch-party-3" />);
          expect(nextRedirect).toHaveBeenLastCalledWith('/news/launch-party-3');
        });

        it('can redirect for a non-default locale', () => {
          vi.mocked(useParams<any>).mockImplementation(() => ({locale: 'de'}));
          vi.mocked(getRequestLocale).mockImplementation(() => 'de');

          vi.mocked(useNextPathname).mockImplementation(() => '/');
          const {rerender} = render(<Component href="/" />);
          expect(nextRedirect).toHaveBeenLastCalledWith('/');

          rerender(<Component href="/about" />);
          expect(nextRedirect).toHaveBeenLastCalledWith('/about');

          rerender(<Component href="/news/launch-party-3" />);
          expect(nextRedirect).toHaveBeenLastCalledWith('/news/launch-party-3');
        });
      });

      describe('permanentRedirect', () => {
        function Component({href}: {href: string}) {
          permanentRedirect(href);
          return null;
        }

        it('can permanently redirect for the default locale', () => {
          vi.mocked(useNextPathname).mockImplementation(() => '/');
          const {rerender} = render(<Component href="/" />);
          expect(nextPermanentRedirect).toHaveBeenLastCalledWith('/');

          rerender(<Component href="/about" />);
          expect(nextPermanentRedirect).toHaveBeenLastCalledWith('/about');

          rerender(<Component href="/news/launch-party-3" />);
          expect(nextPermanentRedirect).toHaveBeenLastCalledWith(
            '/news/launch-party-3'
          );
        });

        it('can permanently redirect for a non-default locale', () => {
          vi.mocked(useParams<any>).mockImplementation(() => ({locale: 'de'}));
          vi.mocked(getRequestLocale).mockImplementation(() => 'de');

          vi.mocked(useNextPathname).mockImplementation(() => '/');
          const {rerender} = render(<Component href="/" />);
          expect(nextPermanentRedirect).toHaveBeenLastCalledWith('/');

          rerender(<Component href="/about" />);
          expect(nextPermanentRedirect).toHaveBeenLastCalledWith('/about');

          rerender(<Component href="/news/launch-party-3" />);
          expect(nextPermanentRedirect).toHaveBeenLastCalledWith(
            '/news/launch-party-3'
          );
        });
      });
    });

    describe('usage without statically known locales', () => {
      const {Link} = createSharedPathnamesNavigation();

      describe('Link', () => {
        it('uses the default locale', () => {
          expect(renderToString(<Link href="/about">About</Link>)).toContain(
            'href="/en/about"'
          );
        });

        it('can use a non-default locale', () => {
          expect(
            renderToString(
              <Link href="/about" locale="de">
                About
              </Link>
            )
          ).toContain('href="/de/about"');
          expect(
            renderToString(
              <Link href="/about" locale="en">
                About
              </Link>
            )
          ).toContain('href="/en/about"');
        });
      });
    });
  }
);
