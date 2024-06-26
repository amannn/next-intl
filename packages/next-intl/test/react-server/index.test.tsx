import React from 'react';
import {describe, expect, vi, it} from 'vitest';
import {
  createTranslator,
  useFormatter,
  useLocale,
  useMessages,
  useNow,
  useTranslations
} from '../../src/react-server';
import {getTranslations} from '../../src/server.react-server';
import {renderToStream} from './utils';

vi.mock('react');

vi.mock('../../src/runtimes/react-server/createRequestConfig', () => ({
  default: async () => ({
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

vi.mock('../../src/runtimes/react-server/RequestLocale', () => ({
  getRequestLocale: vi.fn(() => 'en')
}));

vi.mock('use-intl/core', async (importActual) => {
  const actual: any = await importActual();
  const {createTranslator: actualCreateTranslator} = actual;
  return {
    ...actual,
    createTranslator: vi.fn(actualCreateTranslator)
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

  it('shares message format cache between useTranslations and getTranslations', async () => {
    // First invocation
    useTranslations('Component');
    const firstCallCache =
      vi.mocked(createTranslator).mock.calls[0][0].messageFormatCache;

    // Second invocation with a different namespace
    await getTranslations('Component2');
    const secondCallCache =
      vi.mocked(createTranslator).mock.calls[1][0].messageFormatCache;

    // Verify that the same cache instance is used in both invocations
    expect(firstCallCache).toBe(secondCallCache);
    expect(vi.mocked(createTranslator).mock.calls.length).toBe(2);

    vi.mocked(createTranslator).mockReset();
  });
});
