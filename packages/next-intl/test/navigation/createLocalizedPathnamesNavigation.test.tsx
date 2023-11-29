import {render, screen} from '@testing-library/react';
import {
  usePathname as useNextPathname,
  useParams,
  redirect as nextRedirect
} from 'next/navigation';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {it, describe, vi, expect, beforeEach} from 'vitest';
import createLocalizedPathnamesNavigationClient from '../../src/navigation/react-client/createLocalizedPathnamesNavigation';
import createLocalizedPathnamesNavigationServer from '../../src/navigation/react-server/createLocalizedPathnamesNavigation';
import {Pathnames} from '../../src/navigation.react-client';
import {getRequestLocale} from '../../src/server/RequestLocale';
import BaseLinkWithLocale from '../../src/shared/BaseLinkWithLocale';

vi.mock('next/navigation');
vi.mock('next-intl/config', () => ({
  default: async () =>
    ((await vi.importActual('../../src/server')) as any).getRequestConfig({
      locale: 'en'
    })
}));
vi.mock('react', async (importOriginal) => ({
  ...((await importOriginal()) as typeof import('react')),
  cache(fn: (...args: Array<unknown>) => unknown) {
    return (...args: Array<unknown>) => fn(...args);
  }
}));
// Avoids handling an async component (not supported by renderToString)
vi.mock('../../src/navigation/react-server/BaseLink', () => ({
  default({locale, ...rest}: any) {
    return <BaseLinkWithLocale locale={locale || 'en'} {...rest} />;
  }
}));
vi.mock('../../src/server/RequestLocale', () => ({
  getRequestLocale: vi.fn(() => 'en')
}));

beforeEach(() => {
  // usePathname from Next.js returns the pathname the user sees
  // (i.e. the external one that might be localized)
  vi.mocked(useNextPathname).mockImplementation(() => '/');

  vi.mocked(getRequestLocale).mockImplementation(() => 'en');
  vi.mocked(useParams).mockImplementation(() => ({locale: 'en'}));
});

const locales = ['en', 'de'] as const;
const pathnames = {
  '/': '/',
  '/about': {
    en: '/about',
    de: '/ueber-uns'
  },
  '/news/[articleSlug]-[articleId]': {
    en: '/news/[articleSlug]-[articleId]',
    de: '/neuigkeiten/[articleSlug]-[articleId]'
  },
  '/categories/[...parts]': {
    en: '/categories/[...parts]',
    de: '/kategorien/[...parts]'
  },
  '/catch-all/[[...parts]]': '/catch-all/[[...parts]]'
} satisfies Pathnames<typeof locales>;

describe.each([
  {
    env: 'react-client',
    implementation: createLocalizedPathnamesNavigationClient
  },
  {
    env: 'react-server',
    implementation: createLocalizedPathnamesNavigationServer
  }
])(
  'createLocalizedPathnamesNavigation ($env)',
  ({implementation: createLocalizedPathnamesNavigation}) => {
    describe("localePrefix: 'always'", () => {
      const {Link} = createLocalizedPathnamesNavigation({
        pathnames,
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
      });
    });

    describe("localePrefix: 'as-needed'", () => {
      const {Link, getPathname, redirect} = createLocalizedPathnamesNavigation({
        locales,
        pathnames,
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

        it('adds a prefix when linking to a non-default locale', () => {
          render(
            <Link href="/about" locale="de">
              Über uns
            </Link>
          );
          expect(
            screen.getByRole('link', {name: 'Über uns'}).getAttribute('href')
          ).toBe('/de/ueber-uns');
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

        it('handles catch-all segments', () => {
          render(
            <Link
              href={{
                pathname: '/categories/[...parts]',
                params: {parts: ['clothing', 't-shirts']}
              }}
            >
              Test
            </Link>
          );
          expect(
            screen.getByRole('link', {name: 'Test'}).getAttribute('href')
          ).toBe('/categories/clothing/t-shirts');
        });

        it('handles optional catch-all segments', () => {
          render(
            <Link
              href={{
                pathname: '/catch-all/[[...parts]]',
                params: {parts: ['one', 'two']}
              }}
            >
              Test
            </Link>
          );
          expect(
            screen.getByRole('link', {name: 'Test'}).getAttribute('href')
          ).toBe('/catch-all/one/two');
        });

        it('supports optional search params', () => {
          render(
            <Link href={{pathname: '/about', query: {foo: 'bar', bar: [1, 2]}}}>
              Test
            </Link>
          );
          expect(
            screen.getByRole('link', {name: 'Test'}).getAttribute('href')
          ).toBe('/about?foo=bar&bar=1&bar=2');
        });

        it('handles unknown routes', () => {
          // @ts-expect-error -- Unknown route
          const {rerender} = render(<Link href="/unknown">Unknown</Link>);
          expect(
            screen.getByRole('link', {name: 'Unknown'}).getAttribute('href')
          ).toBe('/unknown');

          rerender(
            // @ts-expect-error -- Unknown route
            <Link href="/unknown" locale="de">
              Unknown
            </Link>
          );
          expect(
            screen.getByRole('link', {name: 'Unknown'}).getAttribute('href')
          ).toBe('/de/unknown');
        });
      });

      describe('redirect', () => {
        function Component<Pathname extends keyof typeof pathnames>({
          href
        }: {
          href: Parameters<typeof redirect<Pathname>>[0];
        }) {
          redirect(href);
          return null;
        }

        it('can redirect for the default locale', () => {
          vi.mocked(useNextPathname).mockImplementation(() => '/');
          const {rerender} = render(<Component href="/" />);
          expect(nextRedirect).toHaveBeenLastCalledWith('/en');

          rerender(<Component href="/about" />);
          expect(nextRedirect).toHaveBeenLastCalledWith('/en/about');

          rerender(
            <Component
              href={{
                pathname: '/news/[articleSlug]-[articleId]',
                params: {
                  articleId: 3,
                  articleSlug: 'launch-party'
                }
              }}
            />
          );
          expect(nextRedirect).toHaveBeenLastCalledWith(
            '/en/news/launch-party-3'
          );
        });

        it('can redirect for a non-default locale', () => {
          vi.mocked(useParams).mockImplementation(() => ({locale: 'de'}));
          vi.mocked(getRequestLocale).mockImplementation(() => 'de');
          vi.mocked(useNextPathname).mockImplementation(() => '/');

          const {rerender} = render(<Component href="/" />);
          expect(nextRedirect).toHaveBeenLastCalledWith('/de');

          rerender(<Component href="/about" />);
          expect(nextRedirect).toHaveBeenLastCalledWith('/de/ueber-uns');

          rerender(
            <Component
              href={{
                pathname: '/news/[articleSlug]-[articleId]',
                params: {
                  articleId: 3,
                  articleSlug: 'launch-party'
                }
              }}
            />
          );
          expect(nextRedirect).toHaveBeenLastCalledWith(
            '/de/neuigkeiten/launch-party-3'
          );
        });

        it('supports optional search params', () => {
          vi.mocked(useNextPathname).mockImplementation(() => '/');
          render(
            <Component
              href={{
                pathname: '/',
                query: {
                  foo: 'bar',
                  bar: [1, 2]
                }
              }}
            />
          );
          expect(nextRedirect).toHaveBeenLastCalledWith(
            '/en?foo=bar&bar=1&bar=2'
          );
        });

        it('handles unknown route', () => {
          vi.mocked(useNextPathname).mockImplementation(() => '/');
          // @ts-expect-error -- Unknown route
          render(<Component href="/unknown" />);
          expect(nextRedirect).toHaveBeenLastCalledWith('/en/unknown');
        });
      });

      describe('getPathname', () => {
        it('resolves to the correct path', () => {
          expect(
            getPathname({
              locale: 'en',
              href: {
                pathname: '/categories/[...parts]',
                params: {parts: ['clothing', 't-shirts']},
                query: {sort: 'price'}
              }
            })
          ).toBe('/categories/clothing/t-shirts?sort=price');
        });
      });
    });

    describe("localePrefix: 'never'", () => {
      describe('Link', () => {
        const {Link} = createLocalizedPathnamesNavigation({
          pathnames,
          locales,
          localePrefix: 'never'
        });

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
          expect(markup).toContain('href="/de/ueber-uns"');
        });
      });
    });
  }
);
