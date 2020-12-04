import {render, screen} from '@testing-library/react';
import React, {ComponentProps, ReactNode} from 'react';
import {IntlError, IntlErrorCode, IntlProvider, useIntl} from '../src';

(global as any).__DEV__ = true;

function MockProvider(
  props: Partial<ComponentProps<typeof IntlProvider>> & {children: ReactNode}
) {
  return <IntlProvider locale="en" messages={{}} {...props} />;
}

describe('formatDateTime', () => {
  const mockDate = new Date('2020-11-20T10:36:01.516Z');

  function renderDateTime(
    value: Date | number,
    options?: Intl.DateTimeFormatOptions
  ) {
    function Component() {
      const intl = useIntl();
      return <>{intl.formatDateTime(value, options)}</>;
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
      const intl = useIntl();
      return <>{intl.formatDateTime(mockDate, 'onlyYear')}</>;
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
      const intl = useIntl();
      return <>{intl.formatDateTime(mockDate, 'onlyHours')}</>;
    }

    render(
      <MockProvider formats={{dateTime: {onlyHours: {hour: 'numeric'}}}}>
        <Component />
      </MockProvider>
    );

    screen.getByText('11 AM');
  });

  describe('error handling', () => {
    it('handles missing formats', () => {
      const onError = jest.fn();

      function Component() {
        const intl = useIntl();
        return <>{intl.formatDateTime(mockDate, 'onlyYear')}</>;
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

    it('handles formatting errors', () => {
      const onError = jest.fn();

      function Component() {
        const intl = useIntl();
        return <>{intl.formatDateTime(mockDate, {year: 'very long'})}</>;
      }

      const {container} = render(
        <MockProvider onError={onError}>
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
  });
});

describe('formatNumber', () => {
  function renderNumber(value: number, options?: Intl.NumberFormatOptions) {
    function Component() {
      const intl = useIntl();
      return <>{intl.formatNumber(value, options)}</>;
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

  it('accepts options', () => {
    renderNumber(299.99, {currency: 'EUR', style: 'currency'});
    screen.getByText('€299.99');
  });

  it('can use a global format', () => {
    function Component() {
      const intl = useIntl();
      return <>{intl.formatNumber(10000, 'noGrouping')}</>;
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
      const onError = jest.fn();

      function Component() {
        const intl = useIntl();
        return <>{intl.formatNumber(mockNumber, 'missing')}</>;
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
      const onError = jest.fn();

      function Component() {
        const intl = useIntl();
        return <>{intl.formatNumber(mockNumber, {currency: 'unknown'})}</>;
      }

      const {container} = render(
        <MockProvider onError={onError}>
          <Component />
        </MockProvider>
      );

      const error: IntlError = onError.mock.calls[0][0];
      expect(error.message).toBe(
        'FORMATTING_ERROR: Invalid currency codes : unknown'
      );
      expect(error.code).toBe(IntlErrorCode.FORMATTING_ERROR);
      expect(container.textContent).toBe('10000');
    });
  });
});

describe('formatRelativeTime', () => {
  function renderNumber(date: Date | number, now: Date | number) {
    function Component() {
      const intl = useIntl();
      return <>{intl.formatRelativeTime(date, now)}</>;
    }

    render(
      <MockProvider>
        <Component />
      </MockProvider>
    );
  }

  it('can format now', () => {
    renderNumber(
      new Date('2020-11-20T10:36:00.000Z'),
      new Date('2020-11-20T10:36:00.100Z')
    );
    screen.getByText('now');
  });

  it('can format seconds', () => {
    renderNumber(
      new Date('2020-11-20T10:35:31.000Z'),
      new Date('2020-11-20T10:36:00.000Z')
    );
    screen.getByText('29 seconds ago');
  });

  it('can format minutes', () => {
    renderNumber(
      new Date('2020-11-20T10:12:00.000Z'),
      new Date('2020-11-20T10:36:00.000Z')
    );
    screen.getByText('24 minutes ago');
  });

  it('uses the lowest unit possible', () => {
    renderNumber(
      new Date('2020-11-20T09:37:00.000Z'),
      new Date('2020-11-20T10:36:00.000Z')
    );
    screen.getByText('59 minutes ago');
  });

  it('can format hours', () => {
    renderNumber(
      new Date('2020-11-20T08:30:00.000Z'),
      new Date('2020-11-20T10:36:00.000Z')
    );
    screen.getByText('2 hours ago');
  });

  it('can format days', () => {
    renderNumber(
      new Date('2020-11-17T10:36:00.000Z'),
      new Date('2020-11-20T10:36:00.000Z')
    );
    screen.getByText('3 days ago');
  });

  it('can format weeks', () => {
    renderNumber(
      new Date('2020-11-02T10:36:00.000Z'),
      new Date('2020-11-20T10:36:00.000Z')
    );
    screen.getByText('3 weeks ago');
  });

  it('can format months', () => {
    renderNumber(
      new Date('2020-03-02T10:36:00.000Z'),
      new Date('2020-11-20T10:36:00.000Z')
    );
    screen.getByText('9 months ago');
  });

  it('can format years', () => {
    renderNumber(
      new Date('1984-11-20T10:36:00.000Z'),
      new Date('2020-11-20T10:36:00.000Z')
    );
    screen.getByText('36 years ago');
  });

  describe('error handling', () => {
    it('handles formatting errors', () => {
      const onError = jest.fn();

      function Component() {
        const intl = useIntl();
        // @ts-ignore Provoke an error
        const date = 'not a number' as number;
        return <>{intl.formatRelativeTime(date, -20)}</>;
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
  });
});
