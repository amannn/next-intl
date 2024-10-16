import React from 'react';
import {describe, expect, vi, it} from 'vitest';
import {getTranslations} from '../server.react-server';
import {renderToStream} from './testUtils';
import {
  useFormatter,
  useLocale,
  useMessages,
  useNow,
  useTranslations,
  _createCache
} from '.';

vi.mock('react');

vi.mock('../../src/server/react-server/createRequestConfig', () => ({
  default: async () => ({
    locale: 'en',
    messages: {
      Component: {
        title: 'Title'
      },
      Component2: {
        title: 'Title2'
      }
    }
  })
}));

vi.mock('use-intl/core', async (importActual) => {
  const actual: any = await importActual();
  return {
    ...actual,
    _createCache: vi.fn(actual._createCache)
  };
});

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

  it('shares a formatter cache between `useTranslations` and `getTranslations`', async () => {
    // First invocation (simulate React rendering)
    try {
      useTranslations('Component');
    } catch (promiseOrError) {
      if (promiseOrError instanceof Promise) {
        await promiseOrError;
        useTranslations('Component');
      } else {
        throw promiseOrError;
      }
    }

    // Second invocation with a different namespace
    await getTranslations('Component2');

    expect(vi.mocked(_createCache).mock.calls.length).toBe(1);
    vi.mocked(_createCache).mockReset();
  });
});
