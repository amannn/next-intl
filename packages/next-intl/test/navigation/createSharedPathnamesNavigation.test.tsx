import {render, screen} from '@testing-library/react';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {it, describe, vi, expect} from 'vitest';
import createSharedPathnamesNavigationClient from '../../src/navigation/react-client/createSharedPathnamesNavigation';
import createSharedPathnamesNavigationServer from '../../src/navigation/react-server/createSharedPathnamesNavigation';
import BaseLinkWithLocale from '../../src/shared/BaseLinkWithLocale';

vi.mock('next/navigation', () => ({
  useParams: () => ({locale: 'en'}),
  usePathname: () => '/'
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
vi.mock('../../src/navigation/react-server/BaseLink', () => ({
  default({locale, ...rest}: any) {
    return <BaseLinkWithLocale locale={locale || 'en'} {...rest} />;
  }
}));

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
      const {Link} = createSharedPathnamesNavigation({
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
    });

    describe("localePrefix: 'never'", () => {
      describe('Link', () => {
        const {Link} = createSharedPathnamesNavigation({
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
          expect(markup).toContain('href="/de/about"');
        });
      });
    });
  }
);
