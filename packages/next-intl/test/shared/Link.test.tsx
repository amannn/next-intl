import {render, screen} from '@testing-library/react';
import React from 'react';
import {Link} from '../../src';

beforeEach(() => {
  document.cookie = 'NEXT_LOCALE=en';
});

it('renders an href without a locale if the locale matches', () => {
  render(<Link href="/test">Test</Link>);
  expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
    '/test'
  );
});

it('renders an href without a locale if the locale matches for an object href', () => {
  render(<Link href={{pathname: '/test'}}>Test</Link>);
  expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
    '/test'
  );
});

it('renders an href with a locale if the locale changes', () => {
  render(
    <Link href="/test" locale="de">
      Test
    </Link>
  );
  expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
    '/de/test'
  );
});

it('renders an href with a locale if the locale changes for an object href', () => {
  render(
    <Link href={{pathname: '/test'}} locale="de">
      Test
    </Link>
  );
  expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
    '/de/test'
  );
});

it('works for external urls', () => {
  render(<Link href="https://example.com">Test</Link>);
  expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
    'https://example.com'
  );
});

it('works for external urls with an object href', () => {
  render(
    <Link
      href={{
        pathname: '/test',
        protocol: 'https:',
        host: 'example.com'
      }}
    >
      Test
    </Link>
  );
  expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
    'https://example.com/test'
  );
});

afterEach(() => {
  document.cookie = '';
});
