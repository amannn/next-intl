import {hasLocale, NextIntlClientProvider} from 'next-intl';
import {getExtracted, getLocale} from 'next-intl/server';
import {cookies} from 'next/headers';
import Link from 'next/link';
import type {ReactNode} from 'react';
import {locales, type Locale} from '@/i18n/config';
import LocaleSwitcher from './LocaleSwitcher';
import './globals.css';

type Props = {
  children: ReactNode;
};

export async function generateMetadata() {
  const t = await getExtracted();
  return {
    title: t('A small blog'),
    description: t('Stories and notes, written once in MDX.')
  };
}

export default async function RootLayout({children}: Props) {
  const locale = await getLocale();
  const t = await getExtracted();

  async function changeLocaleAction(nextLocale: Locale) {
    'use server';
    if (hasLocale(locales, nextLocale)) {
      const store = await cookies();
      store.set('locale', nextLocale, {path: '/'});
    }
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <header className="site-header">
            <Link className="brand" href="/">
              {t('A small blog')}
            </Link>
            <LocaleSwitcher changeLocaleAction={changeLocaleAction} />
          </header>
          <main>{children}</main>
          <footer>{t('One MDX file. Two languages.')}</footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
