import {Locale, NextIntlClientProvider} from 'next-intl';
import {getLocale, getExtracted} from 'next-intl/server';
import {ReactNode} from 'react';
import LocaleSwitcher from './LocaleSwitcher';
import {cookies} from 'next/headers';
import {Inter} from 'next/font/google';

const inter = Inter({subsets: ['latin']});

export async function generateMetadata() {
  const t = await getExtracted();
  return {
    title: t({
      message: 'next-intl example',
      description: 'Default meta title if not overridden by pages'
    })
  };
}

export default async function LocaleLayout({children}) {
  const locale = await getLocale();

  async function changeLocaleAction(locale) {
    'use server';
    const store = await cookies();
    store.set('locale', locale);
  }

  return (
    <html lang={locale}>
      <body
        className={inter.className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}
      >
        <NextIntlClientProvider>
          {children}
          <LocaleSwitcher changeLocaleAction={changeLocaleAction} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
