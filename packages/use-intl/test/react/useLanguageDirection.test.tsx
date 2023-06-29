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

// Test ltr language like English
it('returns the language direction', () => {
  function Component() {
    return <>{useLanguageDirection()}</>;
  }

  render(
    <IntlProvider locale="en">
      <Component />
    </IntlProvider>
  );

  screen.getByText('ltr');
});

// Test ltr language like English with region "en-US"
it('returns the language direction', () => {
  function Component() {
    return <>{useLanguageDirection()}</>;
  }

  render(
    <IntlProvider locale="en-US">
      <Component />
    </IntlProvider>
  );

  screen.getByText('ltr');
});

// Test rtl language like Arabic with region "ar-SA"
it('returns the language direction', () => {
  function Component() {
    return <>{useLanguageDirection()}</>;
  }

  render(
    <IntlProvider locale="ar-SA">
      <Component />
    </IntlProvider>
  );

  screen.getByText('rtl');
});
