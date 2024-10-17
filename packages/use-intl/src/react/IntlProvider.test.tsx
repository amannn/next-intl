import {fireEvent, render, screen} from '@testing-library/react';
import React, {memo, useState} from 'react';
import {expect, it} from 'vitest';
import IntlProvider from './IntlProvider';
import useTranslations from './useTranslations';

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
