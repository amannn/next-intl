import {render, screen} from '@testing-library/react';
import {
  usePathname as useNextPathname,
  useParams,
  redirect as nextRedirect
} from 'next/navigation';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {it, describe, vi, expect, beforeEach} from 'vitest';
import createSharedPathnamesNavigationClient from '../../src/navigation/react-client/createSharedPathnamesNavigation';
import createSharedPathnamesNavigationServer from '../../src/navigation/react-server/createSharedPathnamesNavigation';
import BaseLink from '../../src/navigation/shared/BaseLink';
import {getRequestLocale} from '../../src/server/RequestLocale';

vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({locale: 'en'})),
  usePathname: vi.fn(() => '/'),
  redirect: vi.fn()
}));
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
vi.mock('../../src/navigation/react-server/ServerLink', () => ({
  default({locale, ...rest}: any) {
    return <BaseLink locale={locale || 'en'} {...rest} />;
  }
}));
vi.mock('../../src/server/RequestLocale', () => ({
  getRequestLocale: vi.fn(() => 'en')
}));

beforeEach(() => {
  vi.mocked(getRequestLocale).mockImplementation(() => 'en');
  vi.mocked(useParams).mockImplementation(() => ({locale: 'en'}));
});

const locales = ['en', 'de'] as const;

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
      });
    });

    describe("localePrefix: 'as-needed'", () => {
      const {Link, redirect} = createSharedPathnamesNavigation({
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
          vi.mocked(useParams).mockImplementation(() => ({locale: 'de'}));
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
      });
    });

    describe("localePrefix: 'never'", () => {
      const {Link, redirect} = createSharedPathnamesNavigation({
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
          vi.mocked(useParams).mockImplementation(() => ({locale: 'de'}));
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
    });
  }
);
