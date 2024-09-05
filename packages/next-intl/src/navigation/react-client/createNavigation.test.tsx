import {render, screen} from '@testing-library/react';
import {
  useParams as useNextParams,
  usePathname as useNextPathname
} from 'next/navigation';
import React from 'react';
import {beforeEach, describe, it, vi} from 'vitest';
import createNavigation from './createNavigation';

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useParams: vi.fn(() => ({locale: 'en'})),
    usePathname: vi.fn(() => '/')
  };
});

function mockCurrentLocale(locale: string) {
  vi.mocked(useNextParams<{locale: string}>).mockImplementation(() => ({
    locale
  }));
}

function mockCurrentPathname(string: string) {
  vi.mocked(useNextPathname).mockImplementation(() => string);
}

beforeEach(() => {
  mockCurrentLocale('en');
  mockCurrentLocale('/en');
});

const locales = ['en', 'de', 'ja'] as const;
const defaultLocale = 'en' as const;

describe("localePrefix: 'always'", () => {
  const {usePathname} = createNavigation({
    locales,
    defaultLocale,
    localePrefix: 'always'
  });

  function renderPathname() {
    function Component() {
      return usePathname();
    }
    render(<Component />);
  }

  describe('usePathname', () => {
    it('returns the correct pathname for the default locale', () => {
      mockCurrentLocale('en');
      mockCurrentPathname('/en/about');

      renderPathname();
      screen.getByText('/about');
    });

    it('returns the correct pathname for a secondary locale', () => {
      mockCurrentLocale('de');
      mockCurrentPathname('/de/about');

      renderPathname();
      screen.getByText('/about');
    });
  });
});

describe("localePrefix: 'as-needed'", () => {
  const {usePathname} = createNavigation({
    locales,
    defaultLocale,
    localePrefix: 'as-needed'
  });

  function renderPathname() {
    function Component() {
      return usePathname();
    }
    render(<Component />);
  }

  describe('usePathname', () => {
    it('returns the correct pathname for the default locale', () => {
      mockCurrentLocale('en');
      mockCurrentPathname('/about');

      renderPathname();
      screen.getByText('/about');
    });

    it('returns the correct pathname for a secondary locale', () => {
      mockCurrentLocale('de');
      mockCurrentPathname('/de/about');

      renderPathname();
      screen.getByText('/about');
    });
  });
});

describe("localePrefix: 'never'", () => {
  const {usePathname} = createNavigation({
    locales,
    defaultLocale,
    localePrefix: 'never'
  });

  function renderPathname() {
    function Component() {
      return usePathname();
    }
    render(<Component />);
  }

  describe('usePathname', () => {
    it('returns the correct pathname for the default locale', () => {
      mockCurrentLocale('en');
      mockCurrentPathname('/about');

      renderPathname();
      screen.getByText('/about');
    });

    it('returns the correct pathname for a secondary locale', () => {
      mockCurrentLocale('de');
      mockCurrentPathname('/about');

      renderPathname();
      screen.getByText('/about');
    });
  });
});
