import {render, screen} from '@testing-library/react';
import {parseISO} from 'date-fns';
import type {ComponentProps, ReactElement, ReactNode} from 'react';
import {type SpyImpl, spyOn} from 'tinyspy';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {type IntlError, IntlErrorCode} from '../core.tsx';
import IntlProvider from './IntlProvider.tsx';
import useFormatter from './useFormatter.tsx';

function MockProvider(
  props: Partial<ComponentProps<typeof IntlProvider>> & {children: ReactNode}
) {
  return (
    <IntlProvider
      locale="en"
      messages={{}}
      timeZone="Europe/Berlin"
      {...props}
    />
  );
}

describe('dateTime', () => {
  const mockDate = parseISO('2020-11-20T10:36:01.516Z');

  function renderDateTime(
    value: Date | number,
    options?: Parameters<ReturnType<typeof useFormatter>['dateTime']>['1']
  ) {
    function Component() {
      const format = useFormatter();
      return <>{format.dateTime(value, options)}</>;
    }

    render(
      <MockProvider>
        <Component />
      </MockProvider>
    );
  }

  it('formats a date', () => {
    renderDateTime(mockDate);
    screen.getByText('11/20/2020');
  });

  it('formats a time', () => {
    renderDateTime(mockDate, {minute: 'numeric', hour: 'numeric'});
    screen.getByText('11:36 AM');
  });

  it('accepts options', () => {
    renderDateTime(mockDate, {month: 'long'});
    screen.getByText('November');
  });

  it('formats time', () => {
    renderDateTime(mockDate, {hour: 'numeric', minute: 'numeric'});
    screen.getByText('11:36 AM');
  });

  it('can use a global date format', () => {
    function Component() {
      const format = useFormatter();
      return <>{format.dateTime(mockDate, 'onlyYear')}</>;
    }

    render(
      <MockProvider formats={{dateTime: {onlyYear: {year: 'numeric'}}}}>
        <Component />
      </MockProvider>
    );

    screen.getByText('2020');
  });

  it('can use a global time format', () => {
    function Component() {
      const format = useFormatter();
      return <>{format.dateTime(mockDate, 'onlyHours')}</>;
    }

    render(
      <MockProvider formats={{dateTime: {onlyHours: {hour: 'numeric'}}}}>
        <Component />
      </MockProvider>
    );

    screen.getByText('11 AM');
  });

  it('accepts type-safe custom options', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    () =>
      renderDateTime(mockDate, {
        dateStyle: 'full',
        // @ts-expect-error
        timeStyle: 'unknown'
      });
  });

  describe('time zones', () => {
    it('converts a date to the target time zone', () => {
      renderDateTime(mockDate, {
        timeZone: 'Asia/Shanghai',
        hour: 'numeric',
        minute: 'numeric'
      });
      screen.getByText('6:36 PM');
    });

    it('can use a global time zone', () => {
      function Component() {
        const format = useFormatter();
        return (
          <>
            {format.dateTime(mockDate, {
              hour: 'numeric',
              minute: 'numeric'
            })}
          </>
        );
      }

      render(
        <MockProvider timeZone="Asia/Shanghai">
          <Component />
        </MockProvider>
      );

      screen.getByText('6:36 PM');
    });

    it('can override a global time zone', () => {
      function Component() {
        const format = useFormatter();
        return (
          <>
            {format.dateTime(mockDate, {
              timeZone: 'Australia/Sydney',
              hour: 'numeric',
              minute: 'numeric'
            })}
          </>
        );
      }

      render(
        <MockProvider timeZone="Asia/Shanghai">
          <Component />
        </MockProvider>
      );

      screen.getByText('9:36 PM');
    });
  });

  describe('performance', () => {
    beforeEach(() => {
      vi.spyOn(Intl, 'DateTimeFormat');
    });

    it('caches `Intl.DateTimeFormat` instances', () => {
      function Component() {
        const format = useFormatter();
        return [
          format.dateTime(parseISO('2020-11-20T10:36:01.516Z')),
          format.dateTime(parseISO('2020-11-21T10:36:01.516Z')),
          format.dateTime(parseISO('2020-11-20T10:36:01.516Z'), {
            day: 'numeric',
            month: 'long'
          }),
          format.dateTime(parseISO('2020-11-21T10:36:01.516Z'), {
            day: 'numeric',
            month: 'long'
          })
        ].join(';');
      }

      const {container} = render(
        <MockProvider timeZone="Europe/Berlin">
          <Component />
        </MockProvider>
      );

      expect(container.innerHTML).toMatchInlineSnapshot(
        `"11/20/2020;11/21/2020;November 20;November 21"`
      );
      expect(Intl.DateTimeFormat).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    it('handles missing formats', () => {
      const onError = vi.fn();

      function Component() {
        const format = useFormatter();
        return <>{format.dateTime(mockDate, 'onlyYear')}</>;
      }

      const {container} = render(
        <MockProvider onError={onError}>
          <Component />
        </MockProvider>
      );

      const error: IntlError = onError.mock.calls[0][0];
      expect(error.message).toBe(
        'MISSING_FORMAT: Format `onlyYear` is not available.'
      );
      expect(error.code).toBe(IntlErrorCode.MISSING_FORMAT);
      expect(container.textContent).toMatch(/Nov 20 2020/);
    });

    it('handles missing formats, which are available as defaults for `useTranslations`', () => {
      // This is because we can't safely apply defaults for `dateTime`.
      // `IntlMessageFormat` has defaults for `date` and `time`, but we
      // consider a single `dateTime` namespace to be more useful. Because
      // of this, we can't pick or merge default formats.

      const onError = vi.fn();

      function Component() {
        const format = useFormatter();
        return <>{format.dateTime(mockDate, 'medium')}</>;
      }

      const {container} = render(
        <MockProvider onError={onError}>
          <Component />
        </MockProvider>
      );

      const error: IntlError = onError.mock.calls[0][0];
      expect(error.message).toBe(
        'MISSING_FORMAT: Format `medium` is not available.'
      );
      expect(error.code).toBe(IntlErrorCode.MISSING_FORMAT);
      expect(container.textContent).toMatch(/Nov 20 2020/);
    });

    it('handles formatting errors', () => {
      const onError = vi.fn();

      function Component() {
        const format = useFormatter();

        // @ts-expect-error
        return <>{format.dateTime(mockDate, {year: 'very long'})}</>;
      }

      const {container} = render(
        <MockProvider onError={onError} timeZone="Asia/Shanghai">
          <Component />
        </MockProvider>
      );

      const error: IntlError = onError.mock.calls[0][0];
      expect(error.message).toBe(
        'FORMATTING_ERROR: Value very long out of range for Intl.DateTimeFormat options property year'
      );
      expect(error.code).toBe(IntlErrorCode.FORMATTING_ERROR);
      expect(container.textContent).toMatch(/Nov 20 2020/);
    });

    it('reports an error when formatting a date time and no time zone is available', () => {
      const onError = vi.fn();

      function Component() {
        const format = useFormatter();
        return <>{format.dateTime(mockDate)}</>;
      }

      const {container} = render(
        <MockProvider onError={onError} timeZone={undefined}>
          <Component />
        </MockProvider>
      );

      const error: IntlError = onError.mock.calls[0][0];
      expect(error.message).toMatch(/^ENVIRONMENT_FALLBACK/);
      expect(error.code).toBe(IntlErrorCode.ENVIRONMENT_FALLBACK);
      expect(container.textContent).toBe('11/20/2020');
    });
  });
});

describe('number', () => {
  function renderNumber(
    value: number | bigint,
    options?: Parameters<ReturnType<typeof useFormatter>['number']>['1']
  ) {
    function Component() {
      const format = useFormatter();
      return <>{format.number(value, options)}</>;
    }

    render(
      <MockProvider>
        <Component />
      </MockProvider>
    );
  }

  it('formats a number', () => {
    renderNumber(2948192329.12312);
    screen.getByText('2,948,192,329.123');
  });

  it('formats a bigint', () => {
    renderNumber(123456789123456789n);
    screen.getByText('123,456,789,123,456,789');
  });

  it('accepts options', () => {
    renderNumber(299.99, {currency: 'EUR', style: 'currency'});
    screen.getByText('€299.99');
  });

  it('can use a global format', () => {
    function Component() {
      const format = useFormatter();
      return <>{format.number(10000, 'noGrouping')}</>;
    }

    render(
      <MockProvider formats={{number: {noGrouping: {useGrouping: false}}}}>
        <Component />
      </MockProvider>
    );

    screen.getByText('10000');
  });

  it('accepts type-safe custom options', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    () =>
      renderNumber(2, {
        currency: 'USD',
        // @ts-expect-error
        currencySign: 'unknown'
      });
  });

  describe('performance', () => {
    beforeEach(() => {
      vi.spyOn(Intl, 'NumberFormat');
    });

    it('caches `Intl.NumberFormat` instances', () => {
      function Component() {
        const format = useFormatter();
        return [
          format.number(10000),
          format.number(10001),
          format.number(10000, {
            currency: 'EUR',
            style: 'currency'
          }),
          format.number(10001, {
            currency: 'EUR',
            style: 'currency'
          })
        ].join(';');
      }

      const {container} = render(
        <MockProvider timeZone="Europe/Berlin">
          <Component />
        </MockProvider>
      );

      expect(container.innerHTML).toMatchInlineSnapshot(
        `"10,000;10,001;€10,000.00;€10,001.00"`
      );
      expect(Intl.NumberFormat).toHaveBeenCalledTimes(2);
    });
  });

  describe('error handling', () => {
    const mockNumber = 10000;

    it('handles missing formats', () => {
      const onError = vi.fn();

      function Component() {
        const format = useFormatter();
        return <>{format.number(mockNumber, 'missing')}</>;
      }

      const {container} = render(
        <MockProvider onError={onError}>
          <Component />
        </MockProvider>
      );

      const error: IntlError = onError.mock.calls[0][0];
      expect(error.message).toBe(
        'MISSING_FORMAT: Format `missing` is not available.'
      );
      expect(error.code).toBe(IntlErrorCode.MISSING_FORMAT);
      expect(container.textContent).toBe('10000');
    });

    it('handles formatting errors', () => {
      const onError = vi.fn();

      function Component() {
        const format = useFormatter();
        return <>{format.number(mockNumber, {currency: 'unknown'})}</>;
      }

      const {container} = render(
        <MockProvider onError={onError}>
          <Component />
        </MockProvider>
      );

      const error: IntlError = onError.mock.calls[0][0];
      expect(error.message).toBe(
        'FORMATTING_ERROR: Invalid currency code : unknown'
      );
      expect(error.code).toBe(IntlErrorCode.FORMATTING_ERROR);
      expect(container.textContent).toBe('10000');
    });
  });
});

describe('relativeTime', () => {
  function renderRelativeTime(
    date: Date | number,
    nowOrOptions: Parameters<
      ReturnType<typeof useFormatter>['relativeTime']
    >['1']
  ) {
    function Component() {
      const format = useFormatter();
      return <>{format.relativeTime(date, nowOrOptions)}</>;
    }

    render(
      <MockProvider>
        <Component />
      </MockProvider>
    );
  }

  it('can format now', () => {
    renderRelativeTime(
      parseISO('2020-11-20T10:36:00.000Z'),
      parseISO('2020-11-20T10:36:00.100Z')
    );
    screen.getByText('now');
  });

  it('can format seconds', () => {
    renderRelativeTime(
      parseISO('2020-11-20T10:35:31.000Z'),
      parseISO('2020-11-20T10:36:00.000Z')
    );
    screen.getByText('29 seconds ago');
  });

  it('can format minutes', () => {
    renderRelativeTime(
      parseISO('2020-11-20T10:12:00.000Z'),
      parseISO('2020-11-20T10:36:00.000Z')
    );
    screen.getByText('24 minutes ago');
  });

  it('uses the lowest unit possible', () => {
    renderRelativeTime(
      parseISO('2020-11-20T09:37:00.000Z'),
      parseISO('2020-11-20T10:36:00.000Z')
    );
    screen.getByText('59 minutes ago');
  });

  it('can format hours', () => {
    renderRelativeTime(
      parseISO('2020-11-20T08:30:00.000Z'),
      parseISO('2020-11-20T10:36:00.000Z')
    );
    screen.getByText('2 hours ago');
  });

  it('can format days', () => {
    renderRelativeTime(
      parseISO('2020-11-17T10:36:00.000Z'),
      parseISO('2020-11-20T10:36:00.000Z')
    );
    screen.getByText('3 days ago');
  });

  it('can format weeks', () => {
    renderRelativeTime(
      parseISO('2020-11-02T10:36:00.000Z'),
      parseISO('2020-11-20T10:36:00.000Z')
    );
    screen.getByText('3 weeks ago');
  });

  it('can format months', () => {
    renderRelativeTime(
      parseISO('2020-03-02T10:36:00.000Z'),
      parseISO('2020-11-20T10:36:00.000Z')
    );
    screen.getByText('9 months ago');
  });

  it('can format years', () => {
    renderRelativeTime(
      parseISO('1984-11-20T10:36:00.000Z'),
      parseISO('2020-11-20T10:36:00.000Z')
    );
    screen.getByText('36 years ago');
  });

  it('can use a global `now` fallback', () => {
    function Component() {
      const format = useFormatter();
      const mockDate = parseISO('1984-11-20T10:36:00.000Z');
      return <>{format.relativeTime(mockDate)}</>;
    }

    render(
      <MockProvider now={parseISO('2018-11-20T10:36:00.000Z')}>
        <Component />
      </MockProvider>
    );

    screen.getByText('34 years ago');
  });

  it('accepts type-safe custom options', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    () =>
      renderRelativeTime(parseISO('2020-11-20T10:36:00.000Z'), {
        unit: 'day',
        // @ts-expect-error
        style: 'unknown'
      });
  });

  describe('performance', () => {
    let RelativeTimeFormat: SpyImpl;
    beforeEach(() => {
      RelativeTimeFormat = spyOn(globalThis.Intl, 'RelativeTimeFormat');
    });

    it('caches `Intl.RelativeTimeFormat` instances', () => {
      function Component() {
        const format = useFormatter();

        return [
          format.relativeTime(parseISO('2020-11-20T10:36:00.000Z')),
          format.relativeTime(parseISO('2020-11-21T10:36:00.000Z')),
          format.relativeTime(parseISO('2020-11-20T10:36:00.000Z'), {
            style: 'short'
          }),
          format.relativeTime(parseISO('2020-11-21T10:36:00.000Z'), {
            style: 'short'
          })
        ].join(';');
      }

      render(
        <MockProvider
          now={parseISO('2020-11-01T10:36:00.000Z')}
          timeZone="Europe/Berlin"
        >
          <Component />
        </MockProvider>
      );

      expect(RelativeTimeFormat.callCount).toBe(2);
    });
  });

  describe('error handling', () => {
    it('handles formatting errors', () => {
      const onError = vi.fn();

      function Component() {
        const format = useFormatter();
        // @ts-expect-error Provoke an error
        const date = 'not a number' as number;
        return <>{format.relativeTime(date, -20)}</>;
      }

      const {container} = render(
        <MockProvider onError={onError}>
          <Component />
        </MockProvider>
      );

      const error: IntlError = onError.mock.calls[0][0];
      expect(error.message).toBe(
        'FORMATTING_ERROR: Value need to be finite number for Intl.RelativeTimeFormat.prototype.format()'
      );
      expect(error.code).toBe(IntlErrorCode.FORMATTING_ERROR);
      expect(container.textContent).toBe('not a number');
    });

    it('reports an error when no `now` value is available', () => {
      const onError = vi.fn();

      function Component() {
        const format = useFormatter();
        const mockDate = parseISO('1984-11-20T10:36:00.000Z');
        return <>{format.relativeTime(mockDate)}</>;
      }

      render(
        <MockProvider onError={onError}>
          <Component />
        </MockProvider>
      );

      const error: IntlError = onError.mock.calls[0][0];
      expect(error.message).toMatch(/^ENVIRONMENT_FALLBACK/);
      expect(error.code).toBe(IntlErrorCode.ENVIRONMENT_FALLBACK);
    });
  });
});

describe('list', () => {
  function renderList(
    value: Iterable<string>,
    options?: Parameters<ReturnType<typeof useFormatter>['list']>['1']
  ) {
    function Component() {
      const format = useFormatter();
      return <>{format.list(value, options)}</>;
    }

    render(
      <MockProvider>
        <Component />
      </MockProvider>
    );
  }

  it('formats a list', () => {
    function Component() {
      const format = useFormatter();
      const value = ['apple', 'banana', 'orange'];
      const result = format.list(value);
      expect(typeof result).toBe('string');

      function expectString(v: string) {
        return v;
      }

      return expectString(result);
    }

    render(
      <MockProvider>
        <Component />
      </MockProvider>
    );

    screen.getByText('apple, banana, and orange');
  });

  it('formats a list of rich elements', () => {
    const users = [
      {id: 1, name: 'Alice'},
      {id: 2, name: 'Bob'},
      {id: 3, name: 'Charlie'}
    ];

    function Component() {
      const format = useFormatter();

      const result = format.list(
        users.map((user) => (
          <a key={user.id} href={`/user/${user.id}`}>
            {user.name}
          </a>
        ))
      );

      function expectIterableReactElement(v: Iterable<ReactElement>) {
        return v;
      }

      expect(Array.isArray(result)).toBe(true);
      return expectIterableReactElement(result);
    }

    const {container} = render(
      <MockProvider>
        <Component />
      </MockProvider>
    );

    expect(container.innerHTML).toEqual(
      '<a href="/user/1">Alice</a>, <a href="/user/2">Bob</a>, and <a href="/user/3">Charlie</a>'
    );
  });

  it('accepts a set', () => {
    renderList(new Set(['apple', 'banana', 'orange']));
    screen.getByText('apple, banana, and orange');
  });

  it('accepts options', () => {
    renderList(['apple', 'banana', 'orange'], {type: 'disjunction'});
    screen.getByText('apple, banana, or orange');
  });

  it('can use a global format', () => {
    function Component() {
      const format = useFormatter();
      return <>{format.list(['apple', 'banana', 'orange'], 'enumeration')}</>;
    }

    render(
      <MockProvider formats={{list: {enumeration: {style: 'short'}}}}>
        <Component />
      </MockProvider>
    );

    screen.getByText('apple, banana, & orange');
  });

  it('accepts type-safe custom options', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    () =>
      renderList([], {
        type: 'conjunction',
        // @ts-expect-error
        localeMatcher: 'unknown'
      });
  });

  describe('performance', () => {
    let ListFormat: SpyImpl;
    beforeEach(() => {
      ListFormat = spyOn(globalThis.Intl, 'ListFormat');
    });

    it('caches `Intl.ListFormat` instances', () => {
      function Component() {
        const format = useFormatter();
        return [
          format.list(['apple', 'banana']),
          format.list(['apple', 'banana', 'orange']),
          format.list(['apple', 'banana'], {type: 'disjunction'}),
          format.list(['apple', 'banana', 'orange'], {type: 'disjunction'})
        ].join(';');
      }

      render(
        <MockProvider>
          <Component />
        </MockProvider>
      );

      expect(ListFormat.callCount).toBe(2);
    });
  });
});
