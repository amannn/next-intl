import {render, screen} from '@testing-library/react';
import {it} from 'vitest';
import IntlProvider from './IntlProvider.tsx';
import useLocale from './useLocale.tsx';

it('returns the current locale', () => {
  function Component() {
    return <>{useLocale()}</>;
  }

  render(
    <IntlProvider locale="en">
      <Component />
    </IntlProvider>
  );

  screen.getByText('en');
});
