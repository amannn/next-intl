import {NextIntlClientProvider} from 'next-intl';
import {getLocale} from 'next-intl/server';
import {cookies} from 'next/headers';
import type {ReactNode} from 'react';

import {LocaleActionContextProvider} from '@/i18n/locale-action-context';

export default async function RootLayout({children}: {readonly children: ReactNode}) {
  const locale = await getLocale();

  async function setLocaleAction(next: string) {
    'use server';
    const store = await cookies();
    store.set('locale', next === 'de' ? 'de' : 'en');
  }

  return (
    <html lang={locale}>
      <body style={{fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '40px auto', padding: '0 16px'}}>
        <NextIntlClientProvider>
          <LocaleActionContextProvider setLocaleAction={setLocaleAction}>
            {children}
          </LocaleActionContextProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
