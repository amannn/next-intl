import {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';
import {ReactNode} from 'react';
import AppNavigation from './AppNavigation';
import AppNavigationLocaleSwitcher from './AppNavigationLocaleSwitcher';
import Logout from './Logout';
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
        <div className="flex">
          <div className="flex min-h-[100vh] w-[270px] shrink-0 flex-col justify-between bg-slate-100 p-8">
            <AppNavigation />
            <div className="flex items-center justify-between">
              <AppNavigationLocaleSwitcher />
              <Logout />
            </div>
          </div>
          <div className="p-8">{children}</div>
        </div>
      </NextIntlClientProvider>
    </Document>
  );
}
