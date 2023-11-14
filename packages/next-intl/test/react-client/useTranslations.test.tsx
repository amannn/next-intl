import {render, screen} from '@testing-library/react';
import React from 'react';
import {it, expect, vi} from 'vitest';
import {
  useTranslations,
  NextIntlClientProvider
} from '../../src/index.react-client';

function Component() {
  const t = useTranslations('Component');
  return <>{t('test')}</>;
}

it('provides a helpful error message when no provider is found', () => {
  expect(() => render(<Component />)).toThrow(
    /Failed to call `useTranslations` because the context from `NextIntlClientProvider` was not found\./
  );
});

it('works with a provider', () => {
  render(
    <NextIntlClientProvider locale="en" messages={{Component: {test: 'Hello'}}}>
      <Component />
    </NextIntlClientProvider>
  );
  screen.getByText('Hello');
});

it('uses error handling for missing messages', () => {
  const onError = vi.fn();
  render(
    <NextIntlClientProvider locale="en" onError={onError}>
      <Component />
    </NextIntlClientProvider>
  );
  screen.getByText('Component.test');
  expect(onError).toHaveBeenCalled();
});
