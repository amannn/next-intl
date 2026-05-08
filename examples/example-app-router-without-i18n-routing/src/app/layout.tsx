import {Locale, NextIntlClientProvider} from 'next-intl';
import {getLocale, getTranslations} from 'next-intl/server';
import LocaleSwitcher from './LocaleSwitcher';
import {cookies} from 'next/headers';
import {Inter} from 'next/font/google';

const inter = Inter({subsets: ['latin']});

export async function generateMetadata() {
  const t = await getTranslations('RootLayout');
  return {
    title: t('title')
  };
}

export default async function LocaleLayout({children}: LayoutProps<'/'>) {
  const locale = await getLocale();

  async function changeLocaleAction(locale: Locale) {
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
