import {render, screen} from '@testing-library/react';
import React from 'react';
import {useTranslations} from '../../src';
import {NextIntlClientProvider} from '../../src/client';

jest.mock('next/router', () => ({
  useRouter: () => ({locale: 'en'})
}));

it('can use messages from the provider', () => {
  function Component() {
    const t = useTranslations();
    return <>{t('message')}</>;
  }

  render(
    <NextIntlClientProvider messages={{message: 'Hello'}}>
      <Component />
    </NextIntlClientProvider>
  );

  screen.getByText('Hello');
});

it('can override the locale from Next.js', () => {
  function Component() {
    const t = useTranslations();
    return <>{t('message', {price: 29000.5})}</>;
  }

  render(
    <NextIntlClientProvider
      locale="de"
      messages={{message: '{price, number, ::currency/EUR}'}}
    >
      <Component />
    </NextIntlClientProvider>
  );

  screen.getByText('29.000,50 €');
});
