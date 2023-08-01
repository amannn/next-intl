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
    }
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
