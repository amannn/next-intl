import {fireEvent, render, screen} from '@testing-library/react';
import {usePathname, useParams} from 'next/navigation';
import React from 'react';
import {it, describe, vi, beforeEach, expect} from 'vitest';
import {NextIntlClientProvider} from '../../../src/index.react-client';
import ClientLink from '../../../src/navigation/react-client/ClientLink';

vi.mock('next/navigation');

describe('unprefixed routing', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockImplementation(() => '/');
    vi.mocked(useParams).mockImplementation(() => ({locale: 'en'}));
  });

  it('renders an href without a locale if the locale matches', () => {
    render(<ClientLink href="/test">Test</ClientLink>);
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/test'
    );
  });

  it('renders an href without a locale if the locale matches for an object href', () => {
    render(
      <ClientLink href={{pathname: '/test', query: {foo: 'bar'}}}>
        Test
      </ClientLink>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/test?foo=bar'
    );
  });

  it('renders an href with a locale if the locale changes', () => {
    render(
      <ClientLink href="/test" locale="de">
        Test
      </ClientLink>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/de/test'
    );
  });

  it('renders an href with a locale if the locale changes for an object href', () => {
    render(
      <ClientLink href={{pathname: '/test'}} locale="de">
        Test
      </ClientLink>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/de/test'
    );
  });

  it('works for external urls', () => {
    render(<ClientLink href="https://example.com">Test</ClientLink>);
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      'https://example.com'
    );
  });

  it('works for external urls with an object href', () => {
    render(
      <ClientLink
        href={{
          pathname: '/test',
          protocol: 'https:',
          host: 'example.com'
        }}
      >
        Test
      </ClientLink>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      'https://example.com/test'
    );
  });

  it('can receive a ref', () => {
    let ref;

    render(
      <ClientLink
        ref={(node) => {
          ref = node;
        }}
        href="/test"
      >
        Test
      </ClientLink>
    );

    expect(ref).toBeDefined();
  });

  it('sets an hreflang', () => {
    render(<ClientLink href="/test">Test</ClientLink>);
    expect(
      screen.getByRole('link', {name: 'Test'}).getAttribute('hreflang')
    ).toBe('en');
  });
});

describe('prefixed routing', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockImplementation(() => '/en');
    vi.mocked(useParams).mockImplementation(() => ({locale: 'en'}));
  });

  it('renders an href with a locale if the locale matches', () => {
    render(<ClientLink href="/test">Test</ClientLink>);
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/en/test'
    );
  });

  it('renders an href without a locale if the locale matches for an object href', () => {
    render(<ClientLink href={{pathname: '/test'}}>Test</ClientLink>);
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/en/test'
    );
  });

  it('renders an href with a locale if the locale changes', () => {
    render(
      <ClientLink href="/test" locale="de">
        Test
      </ClientLink>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/de/test'
    );
  });

  it('renders an href with a locale if the locale changes for an object href', () => {
    render(
      <ClientLink href={{pathname: '/test'}} locale="de">
        Test
      </ClientLink>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/de/test'
    );
  });

  it('works for external urls', () => {
    render(<ClientLink href="https://example.com">Test</ClientLink>);
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      'https://example.com'
    );
  });

  it('works for external urls with an object href', () => {
    render(
      <ClientLink
        href={{
          pathname: '/test',
          protocol: 'https:',
          host: 'example.com'
        }}
      >
        Test
      </ClientLink>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      'https://example.com/test'
    );
  });
});

describe('usage outside of Next.js', () => {
  beforeEach(() => {
    vi.mocked(useParams).mockImplementation((() => null) as any);
  });

  it('works with a provider', () => {
    render(
      <NextIntlClientProvider locale="en">
        <ClientLink href="/test">Test</ClientLink>
      </NextIntlClientProvider>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/en/test'
    );
  });

  it('throws without a provider', () => {
    expect(() => render(<ClientLink href="/test">Test</ClientLink>)).toThrow(
      'No intl context found. Have you configured the provider?'
    );
  });
});

it('keeps the cookie value in sync', () => {
  vi.mocked(usePathname).mockImplementation(() => '/en');
  vi.mocked(useParams).mockImplementation(() => ({locale: 'en'}));
  document.cookie = 'NEXT_LOCALE=en';

  render(
    <ClientLink href="/" locale="de">
      Test
    </ClientLink>
  );
  expect(document.cookie).toContain('NEXT_LOCALE=en');
  fireEvent.click(screen.getByRole('link', {name: 'Test'}));
  expect(document.cookie).toContain('NEXT_LOCALE=de');
});
