import {render, screen} from '@testing-library/react';
import React from 'react';
import {it} from 'vitest';
import {useTranslations, NextIntlClientProvider} from '../index';

it('can use messages from the provider', () => {
  function Component() {
    const t = useTranslations();
    return <>{t('message')}</>;
  }

  render(
    <NextIntlClientProvider locale="en" messages={{message: 'Hello'}}>
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
