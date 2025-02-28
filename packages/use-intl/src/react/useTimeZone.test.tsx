import {render, screen} from '@testing-library/react';
import {expect, it} from 'vitest';
import IntlProvider from './IntlProvider.js';
import useTimeZone from './useTimeZone.js';

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
