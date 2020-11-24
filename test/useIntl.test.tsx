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
