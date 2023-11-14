import {render, screen} from '@testing-library/react';
import {
  usePathname,
  useParams,
  useRouter as useNextRouter
} from 'next/navigation';
import React from 'react';
import {it, describe, vi, beforeEach, expect, Mock} from 'vitest';
import createSharedPathnamesNavigation from '../../../src/navigation/react-client/createSharedPathnamesNavigation';

vi.mock('next/navigation');

const {Link, useRouter} = createSharedPathnamesNavigation({
  locales: ['en', 'de'] as const
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
    ).toBe('/de/about');
  });

  it('handles params', () => {
    render(
      <Link href="/news/launch-party-3" locale="de">
        About
      </Link>
    );
    expect(screen.getByRole('link', {name: 'About'}).getAttribute('href')).toBe(
      '/de/news/launch-party-3'
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
      expect(push).toHaveBeenCalledWith('/de/about');
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
}
