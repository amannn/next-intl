import {render, screen} from '@testing-library/react';
import React from 'react';
import {expect, it} from 'vitest';
import IntlProvider from './IntlProvider';
import useTimeZone from './useTimeZone';

it('returns the time zone when it is configured', () => {
  function Component() {
    return <>{useTimeZone()}</>;
  }

  render(
    <IntlProvider locale="de" timeZone="Europe/Berlin">
      <Component />
    </IntlProvider>
  );

  screen.getByText('Europe/Berlin');
});

it('returns undefined when no time zone is configured', () => {
  function Component() {
    return <>{useTimeZone()}</>;
  }

  const {container} = render(
    <IntlProvider locale="de">
      <Component />
    </IntlProvider>
  );

  expect(container.textContent).toBe('');
});
