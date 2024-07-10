import {render, screen} from '@testing-library/react';
import React from 'react';
import {it} from 'vitest';
import IntlProvider from './IntlProvider';
import useLocale from './useLocale';

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
