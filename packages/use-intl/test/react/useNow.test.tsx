import {render, waitFor} from '@testing-library/react';
import {parseISO} from 'date-fns';
import React from 'react';
import {IntlProvider, useNow} from '../../src';

(global as any).__DEV__ = true;

it('returns the current time', () => {
  function Component() {
    return <p>{useNow().toISOString()}</p>;
  }

  const {container} = render(
    <IntlProvider locale="en">
      <Component />
    </IntlProvider>
  );
  expect(container.textContent).toMatch(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
  );
});

it('can use a globally defined `now` value', () => {
  function Component() {
    return <p>{useNow().toISOString()}</p>;
  }

  const {container} = render(
    <IntlProvider locale="en" now={parseISO('2018-10-06T10:36:01.516Z')}>
      <Component />
    </IntlProvider>
  );
  expect(container.textContent).toBe('2018-10-06T10:36:01.516Z');
});

it('can update a globally defined `now` value after the initial render', async () => {
  function Component() {
    return <p>{useNow({updateInterval: 100}).toISOString()}</p>;
  }

  const {container} = render(
    <IntlProvider locale="en" now={parseISO('2018-10-06T10:36:01.516Z')}>
      <Component />
    </IntlProvider>
  );
  expect(container.textContent).toBe('2018-10-06T10:36:01.516Z');

  await waitFor(
    () => {
      if (!container.textContent) throw new Error();
      const curYear = parseInt(container.textContent);

      // If somebody invents time travel, this test will fail.
      // But I guess we'll have other things to deal with then
      // anyway apart from this library ¯\_(ツ)_/¯.
      expect(curYear).toBeGreaterThan(2020);
    },
    {interval: 150}
  );
});

it('can update based on an interval', async () => {
  function Component() {
    return <p>{useNow({updateInterval: 100}).toISOString()}</p>;
  }

  const {container} = render(
    <IntlProvider locale="en">
      <Component />
    </IntlProvider>
  );
  if (!container.textContent) throw new Error();
  const initial = new Date(container.textContent).getTime();

  await waitFor(
    () => {
      if (!container.textContent) throw new Error();
      const now = new Date(container.textContent).getTime();
      expect(now - 900).toBeGreaterThanOrEqual(initial);
    },
    {interval: 150}
  );
});
