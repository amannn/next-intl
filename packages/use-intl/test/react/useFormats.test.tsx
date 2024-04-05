import {render, screen} from '@testing-library/react';
import React from 'react';
import {it, expect} from 'vitest';
import {IntlProvider, useFormats} from '../../src';

function Component() {
  const formats = useFormats();
  return (
    <>
      {JSON.stringify(formats)}
      {/* The returned value can be passed to the provider */}
      <IntlProvider formats={formats} locale="de">
        <p />
      </IntlProvider>
    </>
  );
}

it('returns formats when they are configured', () => {
  render(
    <IntlProvider
      formats={{dateTime: {onlyHours: {hour: 'numeric'}}}}
      locale="de"
    >
      <Component />
    </IntlProvider>
  );

  screen.getByText('{"dateTime":{"onlyHours":{"hour":"numeric"}}}');
});

it('throws when no formats are configured', () => {
  expect(() =>
    render(
      <IntlProvider locale="de">
        <Component />
      </IntlProvider>
    )
  ).toThrow('No formats found.');
});
