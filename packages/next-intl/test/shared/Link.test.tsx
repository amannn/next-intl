import {render, screen} from '@testing-library/react';
import React from 'react';
import BaseLink from '../../src/shared/BaseLink';

beforeEach(() => {
  document.cookie = 'NEXT_LOCALE=en';
});

it('renders an href without a locale if the locale matches', () => {
  render(<BaseLink href="/test">Test</BaseLink>);
  expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
    '/test'
  );
});

it('renders an href without a locale if the locale matches for an object href', () => {
  render(<BaseLink href={{pathname: '/test'}}>Test</BaseLink>);
  expect(screen.getByRole('link', {name: 'Test'}).getAttribute('href')).toBe(
    '/test'
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

afterEach(() => {
  document.cookie = '';
});
