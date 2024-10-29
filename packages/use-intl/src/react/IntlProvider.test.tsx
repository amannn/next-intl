import {fireEvent, render, screen} from '@testing-library/react';
import {memo, useState} from 'react';
import {expect, it, vi} from 'vitest';
import IntlProvider from './IntlProvider.tsx';
import useNow from './useNow.tsx';
import useTranslations from './useTranslations.tsx';

it("doesn't re-render context consumers unnecessarily", () => {
  const messages = {StaticText: {hello: 'Hello!'}};

  let numCounterRenders = 0;
  function Counter() {
    const [count, setCount] = useState(0);
    numCounterRenders++;

    return (
      <>
        <button onClick={() => setCount(count + 1)} type="button">
          Increment
        </button>
        <p>Count: {count}</p>
        <IntlProvider locale="en" messages={messages}>
          <StaticText />
        </IntlProvider>
      </>
    );
  }

  // `memo` is required on this component, as otherwise
  // React doesn't bail out of rendering it.
  let numStaticTextRenders = 0;
  const StaticText = memo(() => {
    const t = useTranslations('StaticText');
    numStaticTextRenders++;
    return t('hello');
  });
  StaticText.displayName = 'StaticText';

  render(<Counter />);
  screen.getByText('Count: 0');
  expect(numCounterRenders).toBe(1);
  expect(numStaticTextRenders).toBe(1);
  fireEvent.click(screen.getByText('Increment'));
  screen.getByText('Count: 1');
  expect(numCounterRenders).toBe(2);
  expect(numStaticTextRenders).toBe(1);
});

it('keeps a consistent context value that does not trigger unnecessary re-renders', () => {
  const messages = {StaticText: {hello: 'Hello!'}};

  let numCounterRenders = 0;
  function Counter() {
    const [count, setCount] = useState(0);
    numCounterRenders++;

    return (
      <>
        <button onClick={() => setCount(count + 1)} type="button">
          Increment
        </button>
        <p>Count: {count}</p>
        <IntlProvider locale="en" messages={messages}>
          <StaticText />
        </IntlProvider>
      </>
    );
  }

  let numStaticTextRenders = 0;
  const StaticText = memo(() => {
    const t = useTranslations('StaticText');
    numStaticTextRenders++;
    return t('hello');
  });
  StaticText.displayName = 'StaticText';

  render(<Counter />);
  screen.getByText('Count: 0');
  expect(numCounterRenders).toBe(1);
  expect(numStaticTextRenders).toBe(1);
  fireEvent.click(screen.getByText('Increment'));
  screen.getByText('Count: 1');
  expect(numCounterRenders).toBe(2);
  expect(numStaticTextRenders).toBe(1);
});

it('passes on configuration in nested providers', () => {
  const onError = vi.fn();

  function Component() {
    const now = useNow();
    const t = useTranslations();
    t('unknown');
    return t('now', {now});
  }

  render(
    <IntlProvider
      formats={{
        dateTime: {
          short: {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
          }
        }
      }}
      locale="en"
      messages={{now: 'Now: {now, date, short}'}}
      now={new Date('2021-01-01T00:00:00Z')}
      // (timeZone is undefined)
    >
      <IntlProvider
        locale="en" // Ideally wouldn't have to specify, but not too bad
        onError={onError}
        timeZone="Europe/Vienna"
      >
        <Component />
      </IntlProvider>
    </IntlProvider>
  );

  screen.getByText('Now: Jan 1, 2021, 1:00 AM');
  expect(onError.mock.calls.length).toBe(1);
});

it('does not merge messages in nested providers', () => {
  // This is important because the locale can change
  // and the messages from a previous locale should
  // not leak into the new locale.

  const onError = vi.fn();

  function Component() {
    const t = useTranslations();
    return t('hello');
  }

  render(
    <IntlProvider locale="en" messages={{hello: 'Hello!'}} onError={onError}>
      <IntlProvider locale="de" messages={{bye: 'Tschüss!'}}>
        <Component />
      </IntlProvider>
    </IntlProvider>
  );

  expect(onError.mock.calls.length).toBe(1);
});
