import {Locale, NextIntlClientProvider} from 'next-intl';
import {getLocale, getExtracted} from 'next-intl/server';
import {ReactNode} from 'react';
import LocaleSwitcher from './LocaleSwitcher';
import {cookies} from 'next/headers';

type Props = {
  children: ReactNode;
};

export async function generateMetadata() {
  const t = await getExtracted();
  return {
    title: t({
      message: 'next-intl example',
      description: 'Default meta title if not overridden by pages'
    })
  };
}

export default async function LocaleLayout({children}: Props) {
  const locale = await getLocale();

  async function changeLocaleAction(locale: Locale) {
    'use server';
    const store = await cookies();
    store.set('locale', locale);
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          {children}
          <LocaleSwitcher changeLocaleAction={changeLocaleAction} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
