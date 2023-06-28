import {render, screen} from '@testing-library/react';
import React from 'react';
import {IntlProvider, useMessages} from '../../src';

it('returns messages when they are configured', () => {
  function Component() {
    return <>{JSON.stringify(useMessages())}</>;
  }

  render(
    <IntlProvider locale="de" messages={{About: {title: 'Hello'}}}>
      <Component />
    </IntlProvider>
  );

  screen.getByText('{"About":{"title":"Hello"}}');
});

it('returns undefined when no messages are configured', () => {
  function Component() {
    return <>{useMessages()}</>;
  }

  const {container} = render(
    <IntlProvider locale="de">
      <Component />
    </IntlProvider>
  );

  expect(container.textContent).toBe('');
});
