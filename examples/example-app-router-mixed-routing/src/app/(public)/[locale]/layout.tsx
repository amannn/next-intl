import {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {Locale, NextIntlClientProvider, hasLocale} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {ReactNode} from 'react';
import Document from '@/components/Document';
import {locales} from '@/config';
import PublicNavigation from './PublicNavigation';
import PublicNavigationLocaleSwitcher from './PublicNavigationLocaleSwitcher';

type Props = {
  children: ReactNode;
  params: {locale: Locale};
};

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export const metadata: Metadata = {
  title: 'next-intl-mixed-routing (public)'
};

export default async function LocaleLayout({
  children,
  params: {locale}
}: Props) {
  // Ensure that the incoming locale is valid
  if (!hasLocale(locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

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
