import {render, screen} from '@testing-library/react';
import {it} from 'vitest';
import IntlProvider from './IntlProvider.js';
import useLocale from './useLocale.js';

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
