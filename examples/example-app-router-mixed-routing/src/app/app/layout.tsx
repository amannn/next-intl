import {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';
import {ReactNode} from 'react';
import AppNavigation from './AppNavigation';
import AppNavigationLocaleSwitcher from './AppNavigationLocaleSwitcher';
import Document from '@/components/Document';

type Props = {
  children: ReactNode;
};

export const metadata: Metadata = {
  title: 'next-intl-mixed-routing (app)'
};

export default async function LocaleLayout({children}: Props) {
  const locale = await getLocale();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <Document locale={locale}>
      <NextIntlClientProvider messages={messages}>
        <AppNavigation />
        <div className="-mx-4 min-h-[200px] bg-slate-100 p-4">{children}</div>
        <AppNavigationLocaleSwitcher />
      </NextIntlClientProvider>
    </Document>
  );
}
