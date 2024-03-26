import {render} from '@testing-library/react';
import {
  usePathname,
  useParams,
  useRouter as useNextRouter
} from 'next/navigation';
import React from 'react';
import {it, describe, vi, beforeEach, expect, Mock} from 'vitest';
import createSharedPathnamesNavigation from '../../../src/navigation/react-client/createSharedPathnamesNavigation';

vi.mock('next/navigation');

const locales = ['en', 'de'] as const;

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

describe("localePrefix: 'as-needed'", () => {
  const {Link, redirect, useRouter} = createSharedPathnamesNavigation({
    locales,
    localePrefix: 'as-needed'
  });

  describe('Link', () => {
    it('supports receiving a ref', () => {
      const ref = React.createRef<HTMLAnchorElement>();
      render(<Link ref={ref} href="/about" />);
      expect(ref.current).not.toBe(null);
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
        expect(push).toHaveBeenCalledWith('/de/about');
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
        expect(push).toHaveBeenCalledWith('/de/about', {scroll: false});
      });
    });
  });

  /**
   * Type tests
   */

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function TypeTests() {
    const router = useRouter();

    // @ts-expect-error -- Only supports string paths
    router.push({pathname: '/about'});

    // Valid
    router.push('/about');
    router.push('/about', {locale: 'de'});
    router.push('/unknown'); // No error since routes are unknown

    // @ts-expect-error -- No params supported
    <Link href="/users/[userId]" params={{userId: 2}}>
      User
    </Link>;

    // @ts-expect-error -- Unknown locale
    <Link href="/about" locale="unknown">
      User
    </Link>;

    // Valid
    <Link href="/about">Über uns</Link>;
    <Link href="/unknown">About</Link>; // No error since routes are unknown

    <RedirectTypeNarrowing />;
  }

  function RedirectTypeNarrowing() {
    function getUserId(): string | undefined {
      return undefined;
    }
    const userId: string | undefined = getUserId();
    if (!userId) {
      redirect('/about');
    }
    const userId2: string = userId;
    return <>{userId2}</>;
  }
});

describe("localePrefix: 'never'", () => {
  const {useRouter} = createSharedPathnamesNavigation({
    locales,
    localePrefix: 'never'
  });

  describe('useRouter', () => {
    function Component({locale}: {locale?: string}) {
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
        vi.mocked(useParams).mockImplementation(() => ({locale: 'de'}));
        render(<Component locale="de" />);
        const push = useNextRouter().push as Mock;
        expect(push).toHaveBeenCalledTimes(1);
        expect(push).toHaveBeenCalledWith('/about');
      });

      it('resolves to the correct path when passing another locale', () => {
        render(<Component locale="de" />);
        const push = useNextRouter().push as Mock;
        expect(push).toHaveBeenCalledTimes(1);
        expect(push).toHaveBeenCalledWith('/de/about');
      });
    });
  });
});
