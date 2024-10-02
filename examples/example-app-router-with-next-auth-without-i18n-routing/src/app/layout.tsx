import clsx from 'clsx';
import {Inter} from 'next/font/google';
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages, getTranslations} from 'next-intl/server';
import {ReactNode} from 'react';
import './globals.css';
import LocaleSwitcher from '@/components/LocaleSwitcher';

const inter = Inter({subsets: ['latin']});

type Props = {
  children: ReactNode;
};

export default async function LocaleLayout({children}: Props) {
  const locale = await getLocale();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  const t = await getTranslations('RootLayout');

  return (
    <html lang={locale}>
      <head>
        <title>next-intl example</title>
      </head>
      <body
        className={clsx(
          'flex min-h-[100vh] flex-col bg-slate-100',
          inter.className
        )}
      >
        <header className="flex items-center justify-between space-x-6 p-5">
          <span>{t('title')}</span>
          <LocaleSwitcher />
        </header>

        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
