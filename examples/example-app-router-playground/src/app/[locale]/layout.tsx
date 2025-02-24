import {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {Locale, NextIntlClientProvider, hasLocale} from 'next-intl';
import {
  getFormatter,
  getNow,
  getTimeZone,
  getTranslations
} from 'next-intl/server';
import {ReactNode} from 'react';
import {routing} from '@/i18n/routing';
import Navigation from '../../components/Navigation';

type Props = {
  children: ReactNode;
  params: {locale: Locale};
};

export async function generateMetadata({
  params: {locale}
}: Omit<Props, 'children'>): Promise<Metadata> {
  const t = await getTranslations({locale, namespace: 'LocaleLayout'});
  const formatter = await getFormatter({locale});
  const now = await getNow({locale});
  const timeZone = await getTimeZone({locale});

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

export default function LocaleLayout({children, params: {locale}}: Props) {
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
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
