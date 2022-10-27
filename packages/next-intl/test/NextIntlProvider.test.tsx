import {render, screen} from '@testing-library/react';
import React from 'react';
import {NextIntlProvider, useTranslations} from '../src';

(global as any).__DEV__ = true;

jest.mock('next/router', () => ({
  useRouter: () => ({locale: 'en'})
}));

it('can use messages from the provider', () => {
  function Component() {
    const t = useTranslations();
    return <>{t('message')}</>;
  }

  render(
    <NextIntlProvider messages={{message: 'Hello'}}>
      <Component />
    </NextIntlProvider>
  );

  screen.getByText('Hello');
});

it('can override the locale from Next.js', () => {
  function Component() {
    const t = useTranslations();
    return <>{t('message', {price: 29000.5})}</>;
  }

  render(
    <NextIntlProvider
      locale="de"
      messages={{message: '{price, number, ::currency/EUR}'}}
    >
      <Component />
    </NextIntlProvider>
  );

  screen.getByText('29.000,50 €');
});
