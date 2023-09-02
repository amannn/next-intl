import {render, screen} from '@testing-library/react';
import {
  usePathname as useNextPathname,
  useParams,
  useRouter as useNextRouter,
  redirect as nextRedirect
} from 'next/navigation';
import React, {ComponentProps} from 'react';
import {it, describe, vi, beforeEach, expect, Mock} from 'vitest';
import {
  Pathnames,
  createLocalizedPathnamesNavigation
} from '../../src/navigation';

vi.mock('next/navigation');

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

const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({
    locales,
    pathnames
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

  // usePathname from Next.js returns the pathname the user sees
  // (i.e. the external one that might be localized)
  vi.mocked(useNextPathname).mockImplementation(() => '/');

  vi.mocked(useParams).mockImplementation(() => ({locale: 'en'}));
});

describe('redirect', () => {
  it('can redirect for the default locale', () => {
    function Component<Pathname extends keyof typeof pathnames>({
      href
    }: {
      href: Parameters<typeof redirect<Pathname>>[0];
    }) {
      redirect(href);
      return null;
    }

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
    expect(nextRedirect).toHaveBeenLastCalledWith('/en/news/launch-party-3');
  });

  it('can redirect for a non-default locale', () => {
    vi.mocked(useParams).mockImplementation(() => ({locale: 'de'}));
    function Component<Pathname extends keyof typeof pathnames>({
      href
    }: {
      href: Parameters<typeof redirect<Pathname>>[0];
    }) {
      redirect(href);
      return null;
    }
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
    function Component<Pathname extends keyof typeof pathnames>({
      href
    }: {
      href: Parameters<typeof redirect<Pathname>>[0];
    }) {
      redirect(href);
      return null;
    }

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
    expect(nextRedirect).toHaveBeenLastCalledWith('/en?foo=bar&bar=1&bar=2');
  });
});

describe('usePathname', () => {
  it('returns the internal pathname for the default locale', () => {
    function Component() {
      const pathname = usePathname();
      return <>{pathname}</>;
    }
    vi.mocked(useNextPathname).mockImplementation(() => '/');
    const {rerender} = render(<Component />);
    screen.getByText('/');

    vi.mocked(useNextPathname).mockImplementation(() => '/about');
    rerender(<Component />);
    screen.getByText('/about');

    vi.mocked(useNextPathname).mockImplementation(() => '/news/launch-party-3');
    rerender(<Component />);
    screen.getByText('/news/[articleSlug]-[articleId]');
  });

  it('returns the internal pathname a non-default locale', () => {
    vi.mocked(useParams).mockImplementation(() => ({locale: 'de'}));

    function Component() {
      const pathname = usePathname();
      return <>{pathname}</>;
    }
    vi.mocked(useNextPathname).mockImplementation(() => '/de');
    const {rerender} = render(<Component />);
    screen.getByText('/');

    vi.mocked(useNextPathname).mockImplementation(() => '/de/ueber-uns');
    rerender(<Component />);
    screen.getByText('/about');

    vi.mocked(useNextPathname).mockImplementation(
      () => '/de/neuigkeiten/launch-party-3'
    );
    rerender(<Component />);
    screen.getByText('/news/[articleSlug]-[articleId]');
  });
});

describe('Link', () => {
  it('renders an href', () => {
    render(<Link href="/about">About</Link>);
    expect(screen.getByRole('link', {name: 'About'}).getAttribute('href')).toBe(
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
    expect(screen.getByRole('link', {name: 'About'}).getAttribute('href')).toBe(
      '/de/neuigkeiten/launch-party-3'
    );
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
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/categories/clothing/t-shirts'
    );
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
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/catch-all/one/two'
    );
  });

  it('supports optional search params', () => {
    render(
      <Link href={{pathname: '/about', query: {foo: 'bar', bar: [1, 2]}}}>
        Test
      </Link>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/about?foo=bar&bar=1&bar=2'
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

    it('supports optional search params', () => {
      function Component() {
        const router = useRouter();
        router.push(
          {
            pathname: '/about',
            query: {
              foo: 'bar',
              bar: [1, 2]
            }
          },
          {locale: 'de'}
        );
        return null;
      }
      render(<Component />);
      const push = useNextRouter().push as Mock;
      expect(push).toHaveBeenCalledTimes(1);
      expect(push).toHaveBeenCalledWith('/de/ueber-uns?foo=bar&bar=1&bar=2');
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
  router.push({pathname: '/about'});
  router.push('/catch-all/[[...parts]]');

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

  // @ts-expect-error -- Unknown locale
  <Link href="/about" locale="unknown">
    Über uns
  </Link>;

  // @ts-expect-error -- Unknown route
  <Link href="/unknown">About</Link>;

  // @ts-expect-error -- Requires params
  <Link href="/news/[articleSlug]-[articleId]">About</Link>;
  // @ts-expect-error -- Requires params
  <Link href={{pathname: '/news/[articleSlug]-[articleId]'}}>About</Link>;

  // @ts-expect-error -- Params for different route
  <Link href={{pathname: '/about', params: {articleId: 2}}}>About</Link>;

  // @ts-expect-error -- Doesn't accept params
  <Link href={{pathname: '/about', params: {foo: 'bar'}}}>About</Link>;

  // @ts-expect-error -- Missing params
  <Link href={{pathname: '/news/[articleSlug]-[articleId]'}}>Über uns</Link>;

  // Valid
  <Link href="/about">Über uns</Link>;
  <Link href={{pathname: '/about'}}>Über uns</Link>;
  <Link
    href={{
      pathname: '/news/[articleSlug]-[articleId]',
      params: {
        articleId: 3,
        articleSlug: 'launch-party'
      },
      query: {foo: 'bar'}
    }}
  >
    Über uns
  </Link>;
  <Link href="/catch-all/[[...parts]]">Optional catch-all</Link>;

  // Link composition
  function WrappedLink<LinkPathname extends keyof typeof pathnames>(
    props: ComponentProps<typeof Link<LinkPathname>>
  ) {
    return <Link {...props} />;
  }
  <WrappedLink href="/about">About</WrappedLink>;
  <WrappedLink
    href={{
      pathname: '/news/[articleSlug]-[articleId]',
      params: {articleSlug: 'launch-party', articleId: 3}
    }}
  >
    News
  </WrappedLink>;

  // @ts-expect-error -- Requires params
  <WrappedLink href="/news/[articleSlug]-[articleId]">News</WrappedLink>;

  // Valid
  redirect({pathname: '/about'});
  redirect('/catch-all/[[...parts]]');
  redirect({
    pathname: '/catch-all/[[...parts]]',
    params: {parts: ['one', 'two']}
  });

  // @ts-expect-error -- Unknown route
  redirect('/unknown');
  // @ts-expect-error -- Localized alternative
  redirect('/ueber-uns');
  // @ts-expect-error -- Requires params
  redirect('/news/[articleSlug]-[articleId]');
  redirect({
    pathname: '/news/[articleSlug]-[articleId]',
    // @ts-expect-error -- Missing param
    params: {
      articleId: 3
    }
  });
}
