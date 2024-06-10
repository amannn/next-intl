import {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {ReactNode} from 'react';
import PublicNavigation from './PublicNavigation';
import PublicNavigationLocaleSwitcher from './PublicNavigationLocaleSwitcher';
import Document from '@/components/Document';

type Props = {
  children: ReactNode;
  params: {locale: string};
};

export const metadata: Metadata = {
  title: 'next-intl-mixed-routing (public)'
};

export default async function LocaleLayout({
  children,
  params: {locale}
}: Props) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <Document locale={locale}>
      <NextIntlClientProvider messages={messages}>
        <div className="m-auto max-w-[60rem] p-4">
          <PublicNavigation />
          <div className="-mx-4 min-h-[200px] bg-slate-100 p-4">{children}</div>
          <PublicNavigationLocaleSwitcher />
        </div>
      </NextIntlClientProvider>
    </Document>
  );
}
