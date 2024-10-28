import {render, screen} from '@testing-library/react';
import React from 'react';
import {it} from 'vitest';
import {NextIntlClientProvider, useNow} from './index.tsx';

function Component() {
  const now = useNow();
  return <>{now.toISOString()}</>;
}

it('works without a provider', () => {
  render(
    <NextIntlClientProvider locale="en">
      <Component />
    </NextIntlClientProvider>
  );
});

it('works with a provider', () => {
  render(
    <NextIntlClientProvider
      locale="en"
      now={new Date('2021-01-01T00:00:00.000Z')}
    >
      <Component />
    </NextIntlClientProvider>
  );
  screen.getByText('2021-01-01T00:00:00.000Z');
});
