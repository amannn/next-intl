import {render, screen} from '@testing-library/react';
import React from 'react';
import {it, expect} from 'vitest';
import IntlProvider from './IntlProvider';
import useMessages from './useMessages';

function Component() {
  const messages = useMessages();
  return (
    <>
      {JSON.stringify(messages)}
      {/* The returned value can be passed to the provider */}
      <IntlProvider locale="de" messages={messages}>
        <p />
      </IntlProvider>
    </>
  );
}

it('returns messages when they are configured', () => {
  render(
    <IntlProvider locale="de" messages={{About: {title: 'Hello'}}}>
      <Component />
    </IntlProvider>
  );

  screen.getByText('{"About":{"title":"Hello"}}');
});

it('throws when no messages are configured', () => {
  expect(() =>
    render(
      <IntlProvider locale="de">
        <Component />
      </IntlProvider>
    )
  ).toThrow('No messages found.');
});
