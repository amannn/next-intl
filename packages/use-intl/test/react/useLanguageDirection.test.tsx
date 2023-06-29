import {render, screen} from '@testing-library/react';
import React from 'react';
import {IntlProvider, useLanguageDirection} from '../../src';

// Test rtl language like Arabic
it('returns the language direction', () => {
  function Component() {
    return <>{useLanguageDirection()}</>;
  }

  render(
    <IntlProvider locale="ar">
      <Component />
    </IntlProvider>
  );

  screen.getByText('rtl');
});


