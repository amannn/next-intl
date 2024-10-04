import {render, screen} from '@testing-library/react';
import {
  usePathname as useNextPathname,
  useParams,
  useRouter as useNextRouter
} from 'next/navigation';
import React, {ComponentProps, useRef} from 'react';
import {it, describe, vi, beforeEach, expect, Mock, afterEach} from 'vitest';
import {Pathnames} from '../../routing';
import createLocalizedPathnamesNavigation from './createLocalizedPathnamesNavigation';

vi.mock('next/navigation');

const locales = ['en', 'de', 'ja'] as const;
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
  '/categories/new': {
    en: '/categories/new',
    de: '/kategorien/neu',
    ja: '/カテゴリ/新規'
  },
  '/catch-all/[[...parts]]': '/catch-all/[[...parts]]'
} satisfies Pathnames<typeof locales>;

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

  vi.mocked(useParams<any>).mockImplementation(() => ({locale: 'en'}));
});

describe("localePrefix: 'as-needed'", () => {
  const {Link, redirect, usePathname, useRouter} =
    createLocalizedPathnamesNavigation({
      locales,
      pathnames
    });

  describe('Link', () => {
    it('supports receiving a ref', () => {
      const ref = React.createRef<HTMLAnchorElement>();
      render(<Link ref={ref} href="/about" />);
      expect(ref.current).not.toBe(null);
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

      vi.mocked(useNextPathname).mockImplementation(
        () => '/news/launch-party-3'
      );
      rerender(<Component />);
      screen.getByText('/news/[articleSlug]-[articleId]');
    });

    it('returns the internal pathname for a more specific pathname that overlaps with another pathname', () => {
      function Component() {
        const pathname = usePathname();
        return <>{pathname}</>;
      }

      vi.mocked(useNextPathname).mockImplementation(() => '/en/categories/new');
      render(<Component />);
      screen.getByText('/categories/new');
    });

    it('returns an encoded pathname correctly', () => {
      function Component() {
        const pathname = usePathname();
        return <>{pathname}</>;
      }
      vi.mocked(useParams<any>).mockImplementation(() => ({locale: 'ja'}));
      vi.mocked(useNextPathname).mockImplementation(() => '/ja/%E7%B4%84');
      render(<Component />);
      screen.getByText('/about');
    });

    it('returns the internal pathname a non-default locale', () => {
      vi.mocked(useParams<any>).mockImplementation(() => ({locale: 'de'}));

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

    it('handles unknown routes', () => {
      function Component() {
        const pathname = usePathname();
        return <>{pathname}</>;
      }
      vi.mocked(useNextPathname).mockImplementation(() => '/en/unknown');
      const {rerender} = render(<Component />);
      screen.getByText('/unknown');

      vi.mocked(useNextPathname).mockImplementation(() => '/de/unknown');
      rerender(<Component />);
      screen.getByText('/de/unknown');
    });

    describe('trailingSlash: true', () => {
      beforeEach(() => {
        process.env._next_intl_trailing_slash = 'true';
      });
      afterEach(() => {
        delete process.env._next_intl_trailing_slash;
      });

      function Component() {
        // eslint-disable-next-line react-compiler/react-compiler
        const pathname = createLocalizedPathnamesNavigation({
          locales,
          pathnames: {
            '/': '/',
            // (w)
            '/about/': {
              en: '/about/', // (w)
              de: '/ueber-uns', // (wo)
              ja: '/約/' // (w)
            },
            // (wo)
            '/news': {
              en: '/news', // (wo)
              de: '/neuigkeiten/', // (w)
              ja: '/ニュース' // (wo)
            }
          }
        }).usePathname();
        return <>{pathname}</>;
      }

      it('returns the root', () => {
        vi.mocked(useParams<any>).mockImplementation(() => ({locale: 'en'}));
        vi.mocked(useNextPathname).mockImplementation(() => '/');
        render(<Component />);
        screen.getByText('/');
      });

      it.each(['/news', '/news/'])(
        'can return an internal pathname without a trailing slash for the default locale (%s)',
        (pathname) => {
          vi.mocked(useParams<any>).mockImplementation(() => ({locale: 'en'}));
          vi.mocked(useNextPathname).mockImplementation(() => pathname);
          render(<Component />);
          screen.getByText('/news');
        }
      );

      it.each(['/de/neuigkeiten/', '/de/neuigkeiten'])(
        'can return an internal pathname without a trailing slash for a secondary locale (%s)',
        (pathname) => {
          vi.mocked(useParams<any>).mockImplementation(() => ({locale: 'de'}));
          vi.mocked(useNextPathname).mockImplementation(() => pathname);
          render(<Component />);
          screen.getByText('/news');
        }
      );

      it.each(['/about', '/about/'])(
        'can return an internal pathname with a trailing slash for the default locale (%s)',
        (pathname) => {
          vi.mocked(useParams<any>).mockImplementation(() => ({locale: 'en'}));
          vi.mocked(useNextPathname).mockImplementation(() => pathname);
          render(<Component />);
          screen.getByText('/about/');
        }
      );

      it.each(['/de/ueber-uns/', '/de/ueber-uns'])(
        'can return an internal pathname with a trailing slash for a secondary locale (%s)',
        (pathname) => {
          vi.mocked(useParams<any>).mockImplementation(() => ({locale: 'de'}));
          vi.mocked(useNextPathname).mockImplementation(() => pathname);
          render(<Component />);
          screen.getByText('/about/');
        }
      );
    });
  });

  describe('useRouter', () => {
    it('keeps a stable identity when possible', () => {
      function Component() {
        const router = useRouter();
        const initialRouter = useRef(router);
        // eslint-disable-next-line react-compiler/react-compiler
        return String(router === initialRouter.current);
      }
      const {rerender} = render(<Component />);
      screen.getByText('true');

      rerender(<Component />);
      screen.getByText('true');
    });

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

      it('passes through unknown options to the Next.js router', () => {
        function Component() {
          const router = useRouter();
          router.push('/about', {locale: 'de', scroll: false});
          return null;
        }
        render(<Component />);
        const push = useNextRouter().push as Mock;
        expect(push).toHaveBeenCalledTimes(1);
        expect(push).toHaveBeenCalledWith('/de/ueber-uns', {scroll: false});
      });
    });

    it('handles unknown routes', () => {
      function Component() {
        const router = useRouter();
        // @ts-expect-error -- Unknown route
        router.push('/unknown');
        return null;
      }
      render(<Component />);
      const push = useNextRouter().push as Mock;
      expect(push).toHaveBeenCalledTimes(1);
      expect(push).toHaveBeenCalledWith('/unknown');
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

    // Allow unknown routes
    const {
      Link: LinkWithUnknown,
      redirect: redirectWithUnknown,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      usePathname: usePathnameWithUnkown,
      useRouter: useRouterWithUnknown
    } = createLocalizedPathnamesNavigation({
      locales,
      pathnames: pathnames as typeof pathnames & Record<string & {}, string>
    });
    <LinkWithUnknown href="/unknown">Unknown</LinkWithUnknown>;
    redirectWithUnknown('/unknown');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const pathnameWithUnknown: ReturnType<typeof usePathnameWithUnkown> =
      '/unknown';
    useRouterWithUnknown().push('/unknown');
  }
});

describe("localePrefix: 'as-needed', custom prefix", () => {
  const {usePathname, useRouter} = createLocalizedPathnamesNavigation({
    locales: ['en', 'de-at'] as const,
    pathnames: {
      '/': '/',
      '/about': {
        en: '/about',
        'de-at': '/ueber-uns'
      }
    },
    localePrefix: {
      mode: 'always',
      prefixes: {
        'de-at': '/de'
      }
    }
  });

  describe('useRouter', () => {
    describe('push', () => {
      it('resolves to the correct path when passing a locale with a custom prefix', () => {
        function Component() {
          const router = useRouter();
          router.push('/about', {locale: 'de-at'});
          return null;
        }
        render(<Component />);
        const push = useNextRouter().push as Mock;
        expect(push).toHaveBeenCalledTimes(1);
        expect(push).toHaveBeenCalledWith('/de/ueber-uns');
      });
    });
  });

  describe('usePathname', () => {
    it('returns the internal pathname for a locale with a custom prefix', () => {
      vi.mocked(useParams<any>).mockImplementation(() => ({locale: 'de-at'}));
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
    });
  });
});

describe("localePrefix: 'never'", () => {
  const {useRouter} = createLocalizedPathnamesNavigation({
    pathnames,
    locales,
    localePrefix: 'never'
  });

  describe('useRouter', () => {
    function Component({locale}: {locale?: (typeof locales)[number]}) {
      const router = useRouter();
      router.push('/about', {locale});
      return null;
    }

    describe('push', () => {
      it('can push a pathname for the default locale', () => {
        render(<Component />);
        const push = useNextRouter().push as Mock;
        expect(push).toHaveBeenCalledTimes(1);
        expect(push).toHaveBeenCalledWith('/about');
      });

      it('can push a pathname for a secondary locale', () => {
        vi.mocked(useParams<any>).mockImplementation(() => ({locale: 'de'}));
        render(<Component locale="de" />);
        const push = useNextRouter().push as Mock;
        expect(push).toHaveBeenCalledTimes(1);
        expect(push).toHaveBeenCalledWith('/ueber-uns');
      });

      it('resolves to the correct path when passing another locale', () => {
        render(<Component locale="de" />);
        const push = useNextRouter().push as Mock;
        expect(push).toHaveBeenCalledTimes(1);
        expect(push).toHaveBeenCalledWith('/de/ueber-uns');
      });
    });
  });
});
