import {render, screen} from '@testing-library/react';
import {usePathname, useParams} from 'next/navigation';
import React from 'react';
import {it, describe, vi, beforeEach, expect} from 'vitest';
import {NextIntlClientProvider} from '../../src';
import BaseLink from '../../src/navigation/BaseLink';

vi.mock('next/navigation');

describe('unprefixed routing', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockImplementation(() => '/');
    vi.mocked(useParams).mockImplementation(() => ({locale: 'en'}));
  });

  it('renders an href without a locale if the locale matches', () => {
    render(<BaseLink href="/test">Test</BaseLink>);
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/test'
    );
  });

  it('renders an href without a locale if the locale matches for an object href', () => {
    render(
      <BaseLink href={{pathname: '/test', query: {foo: 'bar'}}}>Test</BaseLink>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/test?foo=bar'
    );
  });

  it('renders an href with a locale if the locale changes', () => {
    render(
      <BaseLink href="/test" locale="de">
        Test
      </BaseLink>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/de/test'
    );
  });

  it('renders an href with a locale if the locale changes for an object href', () => {
    render(
      <BaseLink href={{pathname: '/test'}} locale="de">
        Test
      </BaseLink>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/de/test'
    );
  });

  it('works for external urls', () => {
    render(<BaseLink href="https://example.com">Test</BaseLink>);
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      'https://example.com'
    );
  });

  it('works for external urls with an object href', () => {
    render(
      <BaseLink
        href={{
          pathname: '/test',
          protocol: 'https:',
          host: 'example.com'
        }}
      >
        Test
      </BaseLink>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      'https://example.com/test'
    );
  });

  it('can receive a ref', () => {
    let ref;

    render(
      <BaseLink
        ref={(node) => {
          ref = node;
        }}
        href="/test"
      >
        Test
      </BaseLink>
    );

    expect(ref).toBeDefined();
  });
});

describe('prefixed routing', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockImplementation(() => '/en');
    vi.mocked(useParams).mockImplementation(() => ({locale: 'en'}));
  });

  it('renders an href with a locale if the locale matches', () => {
    render(<BaseLink href="/test">Test</BaseLink>);
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/en/test'
    );
  });

  it('renders an href without a locale if the locale matches for an object href', () => {
    render(<BaseLink href={{pathname: '/test'}}>Test</BaseLink>);
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/en/test'
    );
  });

  it('renders an href with a locale if the locale changes', () => {
    render(
      <BaseLink href="/test" locale="de">
        Test
      </BaseLink>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/de/test'
    );
  });

  it('renders an href with a locale if the locale changes for an object href', () => {
    render(
      <BaseLink href={{pathname: '/test'}} locale="de">
        Test
      </BaseLink>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/de/test'
    );
  });

  it('works for external urls', () => {
    render(<BaseLink href="https://example.com">Test</BaseLink>);
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      'https://example.com'
    );
  });

  it('works for external urls with an object href', () => {
    render(
      <BaseLink
        href={{
          pathname: '/test',
          protocol: 'https:',
          host: 'example.com'
        }}
      >
        Test
      </BaseLink>
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
        <BaseLink href="/test">Test</BaseLink>
      </NextIntlClientProvider>
    );
    expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
      '/en/test'
    );
  });

  it('throws without a provider', () => {
    expect(() => render(<BaseLink href="/test">Test</BaseLink>)).toThrow(
      'No intl context found. Have you configured the provider?'
    );
  });
});
