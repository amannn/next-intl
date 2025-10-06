import {Locale, NextIntlClientProvider} from 'next-intl';
import {getLocale} from 'next-intl/server';
import {ReactNode} from 'react';
import LocaleSwitcher from './LocaleSwitcher';
import {cookies} from 'next/headers';

type Props = {
  children: ReactNode;
};

export default async function LocaleLayout({children}: Props) {
  const locale = await getLocale();

  async function changeLocaleAction(locale: Locale) {
    'use server';
    const store = await cookies();
    store.set('locale', locale);
  }

  return (
    <html lang={locale}>
      <head>
        <title>next-intl</title>
      </head>
      <body>
        <NextIntlClientProvider>
          {children}
          <LocaleSwitcher changeLocaleAction={changeLocaleAction} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
