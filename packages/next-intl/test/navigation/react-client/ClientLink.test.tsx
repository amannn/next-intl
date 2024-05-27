import {fireEvent, render, screen} from '@testing-library/react';
import {usePathname, useParams} from 'next/navigation';
import React, {ComponentProps, LegacyRef, forwardRef} from 'react';
import {it, describe, vi, beforeEach, expect} from 'vitest';
import {NextIntlClientProvider} from '../../../src/index.react-client';
import ClientLink from '../../../src/navigation/react-client/ClientLink';
import {LocalePrefixConfigVerbose} from '../../../src/shared/types';

vi.mock('next/navigation');

function mockLocation(pathname: string, basePath = '') {
  vi.mocked(usePathname).mockReturnValue(pathname);

  delete (global.window as any).location;
  global.window ??= Object.create(window);
  (global.window as any).location = {pathname: basePath + pathname};
}

const MockClientLink = forwardRef(
  (
    {
      localePrefix = {mode: 'always'},
      ...rest
    }: Omit<ComponentProps<typeof ClientLink>, 'localePrefix'> & {
      localePrefix?: LocalePrefixConfigVerbose<any>;
    },
    ref
  ) => (
    <ClientLink
      ref={ref as LegacyRef<HTMLAnchorElement>}
      localePrefix={localePrefix}
      {...rest}
    />
  )
);

describe('unprefixed routing', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockImplementation(() => '/');
    vi.mocked(useParams).mockImplementation(() => ({locale: 'en'}));
  });

  it('renders an href without a locale if the locale matches', () => {
    render(<MockClientLink href="/test">Test</MockClientLink>);
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/test'
    );
  });

  it('renders an href without a locale if the locale matches for an object href', () => {
    render(
      <MockClientLink href={{pathname: '/test', query: {foo: 'bar'}}}>
        Test
      </MockClientLink>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/test?foo=bar'
    );
  });

  it('renders an href with a locale if the locale changes', () => {
    render(
      <MockClientLink href="/test" locale="de">
        Test
      </MockClientLink>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/de/test'
    );
  });

  it('renders an href with a locale if the locale changes for an object href', () => {
    render(
      <MockClientLink href={{pathname: '/test'}} locale="de">
        Test
      </MockClientLink>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/de/test'
    );
  });

  it('works for external urls', () => {
    render(<MockClientLink href="https://example.com">Test</MockClientLink>);
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      'https://example.com'
    );
  });

  it('handles relative links', () => {
    render(<MockClientLink href="test">Test</MockClientLink>);
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      'test'
    );
  });

  it('works for external urls with an object href', () => {
    render(
      <MockClientLink
        href={{
          pathname: '/test',
          protocol: 'https:',
          host: 'example.com'
        }}
      >
        Test
      </MockClientLink>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      'https://example.com/test'
    );
  });

  it('can receive a ref', () => {
    let ref;

    render(
      <MockClientLink
        ref={(node) => {
          ref = node;
        }}
        href="/test"
      >
        Test
      </MockClientLink>
    );

    expect(ref).toBeDefined();
  });

  it('sets an hreflang when changing the locale', () => {
    render(
      <MockClientLink href="/test" locale="de">
        Test
      </MockClientLink>
    );
    expect(
      screen.getByRole('link', {name: 'Test'}).getAttribute('hreflang')
    ).toBe('de');
  });

  it('updates the href when the query changes for localePrefix=never', () => {
    const {rerender} = render(
      <MockClientLink href={{pathname: '/'}} localePrefix={{mode: 'never'}}>
        Test
      </MockClientLink>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/'
    );
    rerender(
      <MockClientLink
        href={{pathname: '/', query: {foo: 'bar'}}}
        localePrefix={{mode: 'never'}}
      >
        Test
      </MockClientLink>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/?foo=bar'
    );
  });

  describe('base path', () => {
    beforeEach(() => {
      mockLocation('/', '/base/path');
    });

    it('renders an unprefixed href when staying on the same locale', () => {
      render(<MockClientLink href="/test">Test</MockClientLink>);
      expect(
        screen.getByRole('link', {name: 'Test'}).getAttribute('href')
      ).toBe('/test');
    });

    it('renders a prefixed href when switching the locale', () => {
      render(
        <MockClientLink href="/test" locale="de">
          Test
        </MockClientLink>
      );
      expect(
        screen.getByRole('link', {name: 'Test'}).getAttribute('href')
      ).toBe('/de/test');
    });
  });
});

describe('prefixed routing', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockImplementation(() => '/en');
    vi.mocked(useParams).mockImplementation(() => ({locale: 'en'}));
  });

  it('renders an href with a locale if the locale matches', () => {
    render(<MockClientLink href="/test">Test</MockClientLink>);
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/en/test'
    );
  });

  it('renders an href without a locale if the locale matches for an object href', () => {
    render(<MockClientLink href={{pathname: '/test'}}>Test</MockClientLink>);
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/en/test'
    );
  });

  it('renders an href with a locale if the locale changes', () => {
    render(
      <MockClientLink href="/test" locale="de">
        Test
      </MockClientLink>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/de/test'
    );
  });

  it('renders an href with a locale if the locale changes for an object href', () => {
    render(
      <MockClientLink href={{pathname: '/test'}} locale="de">
        Test
      </MockClientLink>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/de/test'
    );
  });

  it('works for external urls', () => {
    render(<MockClientLink href="https://example.com">Test</MockClientLink>);
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      'https://example.com'
    );
  });

  it('works for external urls with an object href', () => {
    render(
      <MockClientLink
        href={{
          pathname: '/test',
          protocol: 'https:',
          host: 'example.com'
        }}
      >
        Test
      </MockClientLink>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      'https://example.com/test'
    );
  });

  describe('base path', () => {
    beforeEach(() => {
      mockLocation('/en', '/base/path');
    });

    it('renders an unprefixed href when staying on the same locale', () => {
      render(<MockClientLink href="/test">Test</MockClientLink>);
      expect(
        screen.getByRole('link', {name: 'Test'}).getAttribute('href')
      ).toBe('/en/test');
    });

    it('renders a prefixed href when switching the locale', () => {
      render(
        <MockClientLink href="/test" locale="de">
          Test
        </MockClientLink>
      );
      expect(
        screen.getByRole('link', {name: 'Test'}).getAttribute('href')
      ).toBe('/de/test');
    });
  });
});

describe('usage outside of Next.js', () => {
  beforeEach(() => {
    vi.mocked(useParams).mockImplementation((() => null) as any);
  });

  it('works with a provider', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockClientLink href="/test">Test</MockClientLink>
      </NextIntlClientProvider>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/en/test'
    );
  });

  it('throws without a provider', () => {
    expect(() =>
      render(<MockClientLink href="/test">Test</MockClientLink>)
    ).toThrow('No intl context found. Have you configured the provider?');
  });
});

describe('cookie sync', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockImplementation(() => '/en');
    vi.mocked(useParams).mockImplementation(() => ({locale: 'en'}));

    mockLocation('/');

    global.document.cookie = 'NEXT_LOCALE=en';
  });

  it('keeps the cookie value in sync', () => {
    render(
      <MockClientLink href="/" locale="de">
        Test
      </MockClientLink>
    );
    expect(document.cookie).toContain('NEXT_LOCALE=en');
    fireEvent.click(screen.getByRole('link', {name: 'Test'}));
    expect(document.cookie).toContain('NEXT_LOCALE=de');
  });
});
