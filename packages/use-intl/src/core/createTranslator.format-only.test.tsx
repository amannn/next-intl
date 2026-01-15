import compile from 'icu-minify/compiler';
import {type ReactElement, isValidElement} from 'react';
import {describe, expect, it, vi} from 'vitest';
import type IntlError from './IntlError.js';
import IntlErrorCode from './IntlErrorCode.js';
import createTranslator from './createTranslator.js';

vi.mock('use-intl/format-message', async () => {
  const formatOnly = await import('./format-message/format-only.js');
  return {
    ...formatOnly,
    default: vi.fn(formatOnly.default)
  };
});

function getTranslator(
  message: string,
  opts: Omit<
    Parameters<typeof createTranslator>[0],
    'locale' | 'messages' | 'namespace'
  > = {}
) {
  return createTranslator({
    locale: 'en',
    messages: {message: compile(message)},
    ...opts
  });
}

it('can handle a plain message', async () => {
  const t = getTranslator('Hello');
  expect(t('message')).toBe('Hello');
});

it('can handle an argument', async () => {
  const t = getTranslator('Hello {param}');
  expect(t('message', {param: 'World'})).toBe('Hello World');
});

it('can handle markup text', async () => {
  const t = getTranslator('<b>Hello {param}</b>');
  expect(
    t.markup('message', {
      param: 'World',
      b: (chunks) => `<b>${chunks}</b>`
    })
  ).toBe('<b>Hello World</b>');
});

it('can handle rich text', async () => {
  const t = getTranslator('<b>Hello {param}</b>');
  const result = t.rich('message', {
    param: 'World',
    b: (chunks) => <b>{chunks}</b>
  });
  expect(isValidElement(result)).toBe(true);
  expect(typeof result).toBe('object');
  expect(result).toMatchInlineSnapshot(`
    <b>
      Hello World
    </b>
  `);
});

it('adds keys for repeated rich text elements', async () => {
  const t = getTranslator('<b>One</b><b>Two</b>');
  const result = t.rich('message', {
    b: (chunks) => <b>{chunks}</b>
  });
  const keys = (result as Array<ReactElement>).map((element) => element.key);
  expect(keys).toMatchInlineSnapshot(`
    [
      "b0",
      "b1",
    ]
  `);
});

it('merges global and local number formats', async () => {
  const t = getTranslator('{total, number, compact} {rate, number, percent}', {
    formats: {
      number: {
        compact: {
          notation: 'compact'
        }
      }
    }
  });

  const result = t(
    'message',
    {
      rate: 0.25,
      total: 1200
    },
    {
      number: {
        percent: {
          maximumFractionDigits: 0,
          style: 'percent'
        }
      }
    }
  );
  expect(result).toMatchInlineSnapshot(`"1.2K 25%"`);
});

it('overrides a global number format with a local one', async () => {
  const t = getTranslator('{rate, number, percent}', {
    formats: {
      number: {
        percent: {
          maximumFractionDigits: 2,
          style: 'percent'
        }
      }
    }
  });

  const result = t(
    'message',
    {rate: 0.25},
    {
      number: {
        percent: {
          maximumFractionDigits: 0,
          style: 'percent'
        }
      }
    }
  );

  expect(result).toMatchInlineSnapshot(`"25%"`);
});

it('prefers the local time zone over a global one', async () => {
  const date = new Date(Date.UTC(2020, 0, 2, 1, 0, 0));
  const dateTimeFormat = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  } as const;
  const t = getTranslator('{value, date, shortDate}', {
    formats: {
      dateTime: {
        shortDate: dateTimeFormat
      }
    },
    timeZone: 'UTC'
  });

  const result = t(
    'message',
    {value: date},
    {
      dateTime: {
        shortDate: {
          ...dateTimeFormat,
          timeZone: 'America/Los_Angeles'
        }
      }
    }
  );
  expect(result).toMatchInlineSnapshot(`"01/01/2020"`);
});

it('uses the global time zone when no local time zone is set', async () => {
  const date = new Date(Date.UTC(2020, 0, 2, 1, 0, 0));
  const t = getTranslator('{value, date, shortDate}', {
    formats: {
      dateTime: {
        shortDate: {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }
      }
    },
    timeZone: 'America/Los_Angeles'
  });

  const result = t('message', {value: date});
  expect(result).toMatchInlineSnapshot(`"01/01/2020"`);
});

describe('error handling', () => {
  it('handles missing arguments', async () => {
    const onError = vi.fn();

    const t = getTranslator('{value}', {onError});
    const result = t('message');

    const error: IntlError = onError.mock.calls[0][0];
    expect(error.message).toBe(
      'FORMATTING_ERROR: Missing value for argument "value"'
    );
    expect(error.code).toBe(IntlErrorCode.FORMATTING_ERROR);

    expect(result).toBe('message');
  });

  it('restricts date values as plain params', async () => {
    const onError = vi.fn();
    const t = getTranslator('{param}', {onError});

    const result = t('message', {param: new Date()});

    const error: IntlError = onError.mock.calls[0][0];
    expect(error.message).toBe(
      'FORMATTING_ERROR: Invalid value for argument "param": Date values are not supported for plain parameters. Use date formatting instead (e.g. {param, date}).'
    );
    expect(error.code).toBe(IntlErrorCode.FORMATTING_ERROR);

    expect(result).toBe('message');
  });

  it('handles errors when React components are provided', async () => {
    const onError = vi.fn();
    const t = getTranslator('<b>Hello {name}</b>', {onError});

    const result = t.markup('message', {
      name: 'world',
      // @ts-expect-error Intentionally broken call site
      b: (chunks) => <b>{chunks}</b>
    });

    expect(onError).toHaveBeenCalledTimes(1);
    const error: IntlError = onError.mock.calls[0][0];
    expect(error.code).toBe(IntlErrorCode.FORMATTING_ERROR);
    expect(error.message).toBe(
      "FORMATTING_ERROR: `t.markup` only accepts functions for formatting that receive and return strings.\n\nE.g. t.markup('markup', {b: (chunks) => `<b>${chunks}</b>`})"
    );
    expect(result).toBe('message');
  });
});
