import {Metadata} from 'next';
import {NextIntlClientProvider, useLocale} from 'next-intl';
import {
  getFormatter,
  getNow,
  getTimeZone,
  getTranslations
} from 'next-intl/server';
import {ReactNode} from 'react';
import {Inter} from 'next/font/google';
import {routing} from '@/i18n/routing';
import Navigation from '../../components/Navigation';

const inter = Inter({subsets: ['latin']});

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export const dynamicParams = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('LocaleLayout');
  const formatter = await getFormatter();
  const now = await getNow();
  const timeZone = await getTimeZone();

  return {
    metadataBase: new URL('http://localhost:3000'),
    title: t('title'),
    description: t('description'),
    other: {
      currentYear: formatter.dateTime(now, {year: 'numeric'}),
      timeZone
    }
  };
}

type Props = {
  children: ReactNode;
};

export default function LocaleLayout({children}: Props) {
  const locale = useLocale();

  return (
    <html className={inter.className} lang={locale}>
      <body>
        <div
          style={{
            padding: 24,
            fontFamily: 'system-ui, sans-serif',
            lineHeight: 1.5
          }}
        >
          <NextIntlClientProvider>
            <Navigation />
            {children}
          </NextIntlClientProvider>
        </div>
      </body>
    </html>
  );
}
