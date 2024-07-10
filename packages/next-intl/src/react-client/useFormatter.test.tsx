import {render, screen} from '@testing-library/react';
import React from 'react';
import {it, expect} from 'vitest';
import {useFormatter, NextIntlClientProvider} from '.';

function Component() {
  const format = useFormatter();
  return <>{format.number(1)}</>;
}

it('provides a helpful error message when no provider is found', () => {
  expect(() => render(<Component />)).toThrow(
    /Failed to call `useFormatter` because the context from `NextIntlClientProvider` was not found\./
  );
});

it('works with a provider', () => {
  render(
    <NextIntlClientProvider locale="en">
      <Component />
    </NextIntlClientProvider>
  );
  screen.getByText('1');
});
