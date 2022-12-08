import {render, screen} from '@testing-library/react';
import React from 'react';
import {IntlProvider, useLocale} from '../../src';

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
