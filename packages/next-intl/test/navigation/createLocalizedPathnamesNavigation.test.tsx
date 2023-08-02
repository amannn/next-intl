import {render, screen} from '@testing-library/react';
import {
  usePathname,
  useParams,
  useRouter as useNextRouter
} from 'next/navigation';
import React from 'react';
import {it, describe, vi, beforeEach, expect, Mock} from 'vitest';
import {createLocalizedPathnamesNavigation} from '../../src/navigation';

vi.mock('next/navigation');

const {Link, useRouter} = createLocalizedPathnamesNavigation({
  locales: ['en', 'de'],
  pathnames: {
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
  }
});

beforeEach(() => {
  const router = {
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn()
  };
  vi.mocked(useNextRouter).mockImplementation(() => router);
  vi.mocked(usePathname).mockImplementation(() => '/');
  vi.mocked(useParams).mockImplementation(() => ({locale: 'en'}));
});

describe('Link', () => {
  it('renders an href', () => {
    render(<Link href="/about">About</Link>);
    expect(screen.getByRole('link', {name: 'About'}).getAttribute('href')).toBe(
      '/about'
    );
  });

  it('renders an object href', () => {
    render(<Link href={{pathname: '/about', query: {foo: 'bar'}}}>About</Link>);
    expect(screen.getByRole('link', {name: 'About'}).getAttribute('href')).toBe(
      '/about?foo=bar'
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
        href="/news/[articleSlug]-[articleId]"
        locale="de"
        params={{
          articleId: 3,
          articleSlug: 'launch-party'
        }}
      >
        About
      </Link>
    );
    expect(screen.getByRole('link', {name: 'About'}).getAttribute('href')).toBe(
      '/de/neuigkeiten/launch-party-3'
    );
  });

  it('handles catch-all segments', () => {
    render(
      <Link
        href="/categories/[...parts]"
        params={{parts: ['clothing', 't-shirts']}}
      >
        Test
      </Link>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/categories/clothing/t-shirts'
    );
  });

  it('handles optional catch-all segments', () => {
    render(
      <Link href="/catch-all/[[...parts]]" params={{parts: ['one', 'two']}}>
        Test
      </Link>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/catch-all/one/two'
    );
  });
});

describe('useRouter', () => {
  describe('push', () => {
    it('resolves to the correct path when passing another locale', () => {
      function Component() {
        const router = useRouter();
        router.push('/about', {locale: 'de'});
        return null;
      }
      render(<Component />);
      const push = useNextRouter().push as Mock;
      expect(push).toHaveBeenCalledTimes(1);
      expect(push).toHaveBeenCalledWith('/de/ueber-uns');
    });
  });
});

/**
 * Type tests
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TypeTests() {
  const router = useRouter();

  // @ts-expect-error -- Unknown route
  router.push('/unknown');

  // Valid
  router.push('/about');
  router.push('/about', {locale: 'de'});

  // @ts-expect-error -- Needs to be passed as string
  router.push({pathname: '/about'});

  // @ts-expect-error -- Requires params
  router.push({pathname: '/news/[articleSlug]-[articleId]'});

  router.push({
    pathname: '/news/[articleSlug]-[articleId]',
    // @ts-expect-error -- Missing param
    params: {
      articleId: 3
    }
  });

  // Valid
  router.push({
    pathname: '/news/[articleSlug]-[articleId]',
    params: {
      articleId: 3,
      articleSlug: 'launch-party'
    }
  });

  // @ts-expect-error -- Doesn't accept params
  router.push({pathname: '/about', params: {foo: 'bar'}});

  // @ts-expect-error -- Unknown route
  <Link href="/unknown">About</Link>;

  // @ts-expect-error -- Requires params
  <Link href="/news/[articleSlug]-[articleId]">About</Link>;

  // @ts-expect-error -- Params for different route
  <Link href="/about" params={{articleId: 2}}>
    About
  </Link>;

  // @ts-expect-error -- Doesn't accept params
  <Link href="/about" params={{foo: 'bar'}}>
    About
  </Link>;

  // @ts-expect-error -- Missing params
  <Link href={{pathname: '/news/[articleSlug]-[articleId]'}}>Über uns</Link>;

  // Valid
  <Link href="/about">Über uns</Link>;
  <Link href={{pathname: '/about'}}>Über uns</Link>;
  <Link
    href={{
      pathname: '/news/[articleSlug]-[articleId]',
      query: {foo: 'bar'}
    }}
    params={{
      articleId: 3,
      articleSlug: 'launch-party'
    }}
  >
    Über uns
  </Link>;
  <Link href="/catch-all/[[...parts]]">Catch-all</Link>;
}
