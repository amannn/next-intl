import {render, screen} from '@testing-library/react';
import React from 'react';
import {NextIntlProvider, useIntl} from '../src';

(global as any).__DEV__ = true;

jest.mock('next/router', () => ({
  useRouter: () => ({locale: 'en'})
}));

describe('formatDate', () => {
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
      <NextIntlProvider messages={{}}>
        <Component />
      </NextIntlProvider>
    );
  }

  it('formats a date', () => {
    renderDateTime(mockDate);
    screen.getByText('11/20/2020');
  });

  it('accepts options', () => {
    renderDateTime(mockDate, {month: 'long'});
    screen.getByText('November');
  });

  it('formats time', () => {
    renderDateTime(mockDate, {hour: 'numeric', minute: 'numeric'});
    screen.getByText('11:36 AM');
  });
});

describe('formatNumber', () => {
  function renderNumber(value: number, options?: Intl.NumberFormatOptions) {
    function Component() {
      const intl = useIntl();
      return <>{intl.formatNumber(value, options)}</>;
    }

    render(
      <NextIntlProvider messages={{}}>
        <Component />
      </NextIntlProvider>
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
});

describe('formatRelativeTime', () => {
  function renderNumber(date: Date | number, now: Date | number) {
    function Component() {
      const intl = useIntl();
      return <>{intl.formatRelativeTime(date, now)}</>;
    }

    render(
      <NextIntlProvider messages={{}}>
        <Component />
      </NextIntlProvider>
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
});
