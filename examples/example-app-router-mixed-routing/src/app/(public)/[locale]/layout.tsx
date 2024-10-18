import {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, unstable_setRequestLocale} from 'next-intl/server';
import {ReactNode} from 'react';
import Document from '@/components/Document';
import {locales} from '@/config';
import PublicNavigation from './PublicNavigation';
import PublicNavigationLocaleSwitcher from './PublicNavigationLocaleSwitcher';

type Props = {
  children: ReactNode;
  params: Promise<{locale: string}>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export const metadata: Metadata = {
  title: 'next-intl-mixed-routing (public)'
};

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;

  // Enable static rendering
  unstable_setRequestLocale(locale);

  // Ensure that the incoming locale is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

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
