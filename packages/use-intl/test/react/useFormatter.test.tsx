import {render, screen} from '@testing-library/react';
import {parseISO} from 'date-fns';
import React, {ComponentProps, ReactNode, ReactElement} from 'react';
import {it, expect, describe, vi} from 'vitest';
import {
  DateTimeFormatOptions,
  NumberFormatOptions,
  IntlError,
  IntlErrorCode,
  IntlProvider,
  useFormatter
} from '../../src';

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
    options?: DateTimeFormatOptions
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
        'MISSING_FORMAT: Format `onlyYear` is not available. You can configure it on the provider or provide custom options.'
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
        'MISSING_FORMAT: Format `medium` is not available. You can configure it on the provider or provide custom options.'
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
      expect(error.message).toMatch(
        "ENVIRONMENT_FALLBACK: The `timeZone` parameter wasn't provided and there is no global default configured."
      );
      expect(error.code).toBe(IntlErrorCode.ENVIRONMENT_FALLBACK);
      expect(container.textContent).toBe('11/20/2020');
    });
  });
});

describe('number', () => {
  function renderNumber(value: number | bigint, options?: NumberFormatOptions) {
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
        'MISSING_FORMAT: Format `missing` is not available. You can configure it on the provider or provide custom options.'
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
  function renderNumber(date: Date | number, now: Date | number) {
    function Component() {
      const format = useFormatter();
      return <>{format.relativeTime(date, now)}</>;
    }

    render(
      <MockProvider>
        <Component />
      </MockProvider>
    );
  }

  it('can format now', () => {
    renderNumber(
      parseISO('2020-11-20T10:36:00.000Z'),
      parseISO('2020-11-20T10:36:00.100Z')
    );
    screen.getByText('now');
  });

  it('can format seconds', () => {
    renderNumber(
      parseISO('2020-11-20T10:35:31.000Z'),
      parseISO('2020-11-20T10:36:00.000Z')
    );
    screen.getByText('29 seconds ago');
  });

  it('can format minutes', () => {
    renderNumber(
      parseISO('2020-11-20T10:12:00.000Z'),
      parseISO('2020-11-20T10:36:00.000Z')
    );
    screen.getByText('24 minutes ago');
  });

  it('uses the lowest unit possible', () => {
    renderNumber(
      parseISO('2020-11-20T09:37:00.000Z'),
      parseISO('2020-11-20T10:36:00.000Z')
    );
    screen.getByText('59 minutes ago');
  });

  it('can format hours', () => {
    renderNumber(
      parseISO('2020-11-20T08:30:00.000Z'),
      parseISO('2020-11-20T10:36:00.000Z')
    );
    screen.getByText('2 hours ago');
  });

  it('can format days', () => {
    renderNumber(
      parseISO('2020-11-17T10:36:00.000Z'),
      parseISO('2020-11-20T10:36:00.000Z')
    );
    screen.getByText('3 days ago');
  });

  it('can format weeks', () => {
    renderNumber(
      parseISO('2020-11-02T10:36:00.000Z'),
      parseISO('2020-11-20T10:36:00.000Z')
    );
    screen.getByText('3 weeks ago');
  });

  it('can format months', () => {
    renderNumber(
      parseISO('2020-03-02T10:36:00.000Z'),
      parseISO('2020-11-20T10:36:00.000Z')
    );
    screen.getByText('9 months ago');
  });

  it('can format years', () => {
    renderNumber(
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
      expect(error.message).toMatch(
        "ENVIRONMENT_FALLBACK: The `now` parameter wasn't provided and there is no global default configured."
      );
      expect(error.code).toBe(IntlErrorCode.ENVIRONMENT_FALLBACK);
    });
  });
});

describe('list', () => {
  function renderList(
    value: Iterable<string>,
    options?: Intl.ListFormatOptions
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

      const result = format.list([
        ...users.map((user) => (
          <a key={user.id} href={`/user/${user.id}`}>
            {user.name}
          </a>
        )),
        // An `Iterable<ReactElement>` as a single element
        [<span key="one">One</span>, <span key="two">Two</span>]
      ]);

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
      '<a href="/user/1">Alice</a>, <a href="/user/2">Bob</a>, <a href="/user/3">Charlie</a>, and <span>One</span><span>Two</span>'
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
});
