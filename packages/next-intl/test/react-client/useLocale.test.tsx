import {render, screen} from '@testing-library/react';
import {useParams} from 'next/navigation';
import React from 'react';
import {expect, it, vi} from 'vitest';
import {NextIntlClientProvider, useLocale} from '../../src';

vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({locale: 'en'}))
}));

function Component() {
  return <>{useLocale()}</>;
}

it('returns a locale from `useParams` without a provider', () => {
  render(<Component />);
  screen.getByText('en');
});

it('prioritizes the locale from the provider', () => {
  render(
    <NextIntlClientProvider locale="de">
      <Component />
    </NextIntlClientProvider>
  );
  screen.getByText('de');
});

it('throws if neither a locale from the provider or useParams is available', () => {
  vi.mocked(useParams).mockImplementation(() => ({}));
  expect(() => render(<Component />)).toThrow(
    'No intl context found. Have you configured the provider?'
  );
});
