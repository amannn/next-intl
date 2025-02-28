import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getTranslations} from 'next-intl/server';
import {ReactNode} from 'react';
import {clsx} from 'clsx';
import {Inter} from 'next/font/google';
import {routing} from '@/i18n/routing';
import Navigation from '@/components/Navigation';
import '@/styles.css';

type Props = {
  children: ReactNode;
};

const inter = Inter({subsets: ['latin']});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export const dynamicParams = false;

export async function generateMetadata() {
  const t = await getTranslations('LocaleLayout');

  return {
    title: t('title')
  };
}

export default async function LocaleLayout({children}: Props) {
  const locale = await getLocale();

  return (
    <html className="h-full" lang={locale}>
      <body className={clsx(inter.className, 'flex h-full flex-col')}>
        <NextIntlClientProvider>
          <Navigation />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
