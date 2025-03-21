import {render, screen} from '@testing-library/react';
import {expect, it} from 'vitest';
import {NextIntlClientProvider, useFormatter} from './index.js';

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
