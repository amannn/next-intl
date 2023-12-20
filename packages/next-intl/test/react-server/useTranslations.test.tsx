import React, {Suspense, cache} from 'react';
import {ReactDOMServerReadableStream} from 'react-dom/server';
// @ts-expect-error -- Not available in types
import {renderToReadableStream as _renderToReadableStream} from 'react-dom/server.browser';
import {describe, expect, it, vi, beforeEach} from 'vitest';
import {createTranslator, useTranslations} from '../../src/react-server';

global.ReadableStream =
  require('web-streams-polyfill/ponyfill/es6').ReadableStream;
global.TextEncoder = require('util').TextEncoder;

const renderToReadableStream: typeof import('react-dom/server').renderToReadableStream =
  _renderToReadableStream;

vi.mock('../../src/server/react-server/createRequestConfig', () => ({
  default: async () => ({
    messages: {
      A: {
        title: 'A'
      },
      B: {
        title: 'B'
      },
      C: {
        title: 'C'
      }
    }
  })
}));

vi.mock('../../src/server/react-server/RequestLocale', () => ({
  getRequestLocale: vi.fn(() => 'en')
}));

vi.mock('react');

vi.mock('use-intl/core', async (importActual) => {
  const actual: any = await importActual();
  const {createTranslator: actualCreateTranslator} = actual;
  return {
    ...actual,
    createTranslator: vi.fn(actualCreateTranslator)
  };
});

async function readStream(stream: ReactDOMServerReadableStream) {
  const reader = stream.getReader();
  let result = '';
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    result += Buffer.from(value).toString('utf8');
  }
  return result;
}

describe('performance', () => {
  let attemptedRenders: Record<string, number>;
  let finishedRenders: Record<string, number>;

  beforeEach(() => {
    attemptedRenders = {};
    finishedRenders = {};
    (cache as any).reset();
  });

  function attempt(componentName: string) {
    attemptedRenders[componentName] ??= 0;
    attemptedRenders[componentName]++;
  }

  function finish(componentName: string) {
    finishedRenders[componentName] ??= 0;
    finishedRenders[componentName]++;
  }

  it('suspends only once when rendering the same component twice (i.e. multiple `useTranslations` calls with the same namespace)', async () => {
    function A({quit}: {quit?: boolean}) {
      attempt('A');
      const t = useTranslations('A');
      finish('A');
      return (
        <>
          {t('title')}
          {!quit && <A quit />}
        </>
      );
    }

    await readStream(
      await renderToReadableStream(
        <Suspense>
          <A />
        </Suspense>
      )
    );

    expect({attemptedRenders, finishedRenders}).toMatchInlineSnapshot(`
      {
        "attemptedRenders": {
          "A": 3,
        },
        "finishedRenders": {
          "A": 2,
        },
      }
    `);
  });

  it('suspends only once when rendering different components (i.e. multiple `useTranslations` calls with a different namespace)', async () => {
    function A() {
      attempt('A');
      const t = useTranslations('A');
      finish('A');
      return (
        <>
          {t('title')}
          <B />
        </>
      );
    }

    function B() {
      attempt('B');
      const t = useTranslations('B');
      finish('B');
      return t('title');
    }

    await readStream(
      await renderToReadableStream(
        <Suspense>
          <A />
        </Suspense>
      )
    );

    expect({attemptedRenders, finishedRenders}).toMatchInlineSnapshot(`
      {
        "attemptedRenders": {
          "A": 2,
          "B": 1,
        },
        "finishedRenders": {
          "A": 1,
          "B": 1,
        },
      }
    `);
  });

  it('resolves the config only once for a complex tree', async () => {
    function A() {
      attempt('A');
      const t = useTranslations('A');
      finish('A');
      return t('title');
    }

    function B() {
      attempt('B');
      const t = useTranslations('B');
      finish('B');
      return t('title');
    }

    function C() {
      attempt('C');
      const t = useTranslations();
      finish('C');
      return t('C.title');
    }

    function E() {
      attempt('E');
      finish('E');
      return <A />;
    }

    function D() {
      attempt('D');
      finish('D');
      return (
        <>
          <A />
          <B />
          <C />
          <E />
        </>
      );
    }

    await readStream(
      await renderToReadableStream(
        <Suspense>
          <A />
          <B />
          <C />
          <D />
        </Suspense>
      )
    );

    expect({attemptedRenders, finishedRenders}).toMatchInlineSnapshot(`
      {
        "attemptedRenders": {
          "A": 6,
          "B": 4,
          "C": 4,
          "D": 1,
          "E": 1,
        },
        "finishedRenders": {
          "A": 3,
          "B": 2,
          "C": 2,
          "D": 1,
          "E": 1,
        },
      }
    `);
  });

  it('instantiates a single translator per namespace', async () => {
    vi.mocked(createTranslator).mockImplementation(() => (() => 'Test') as any);

    function Component() {
      useTranslations('CreateTranslatorInstancesTest-1');
      useTranslations('CreateTranslatorInstancesTest-1');
      useTranslations('CreateTranslatorInstancesTest-2');
      return null;
    }
    await readStream(
      await renderToReadableStream(
        <>
          <Component />
        </>
      )
    );

    function getCalls(namespace: string) {
      return vi
        .mocked(createTranslator)
        .mock.calls.filter(
          ([{namespace: _namespace}]) => _namespace === namespace
        );
    }

    expect(getCalls('CreateTranslatorInstancesTest-1').length).toEqual(1);
    expect(getCalls('CreateTranslatorInstancesTest-2').length).toEqual(1);
  });
});
