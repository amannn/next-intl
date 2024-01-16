import React from 'react';
import {describe, expect, vi, it} from 'vitest';
import {
  useFormatter,
  useLocale,
  useMessages,
  useNow,
  useTranslations
} from '../../src/react-server';
import {renderToStream} from './utils';

vi.mock('react');

vi.mock('../../src/server/react-server/createRequestConfig', () => ({
  default: async () => ({
    messages: {
      Component: {
        title: 'Title'
      }
    }
  })
}));

vi.mock('../../src/server/react-server/RequestLocale', () => ({
  getRequestLocale: vi.fn(() => 'en')
}));

describe('performance', () => {
  it('suspends only once when using a mixture of hooks', async () => {
    let renderCount = 0;

    function Component({quit}: {quit?: boolean}) {
      renderCount++;

      const t = useTranslations('Component');
      const format = useFormatter();
      const locale = useLocale();
      const messages = useMessages();
      const now = useNow();

      return (
        <>
          {now.toISOString()}
          {JSON.stringify(messages)}
          {locale}
          {format.number(1000)}
          {t('title')}
          {!quit && <Component quit />}
        </>
      );
    }

    await renderToStream(<Component />);

    // Render 1: Suspends when `useTranslations` is encountered
    // Render 2: Synchronously renders through
    // Render 3: Recursive call that renders synchronously as well
    expect(renderCount).toBe(3);
  });
});
