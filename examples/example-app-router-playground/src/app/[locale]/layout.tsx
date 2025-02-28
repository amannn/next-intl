import {Metadata} from 'next';
<<<<<<< HEAD
import {NextIntlClientProvider, useLocale} from 'next-intl';
=======
import {Inter} from 'next/font/google';
import {notFound} from 'next/navigation';
import {Locale, NextIntlClientProvider, hasLocale} from 'next-intl';
>>>>>>> origin/v4
import {
  getFormatter,
  getNow,
  getTimeZone,
  getTranslations
} from 'next-intl/server';
import {ReactNode} from 'react';
import {routing} from '@/i18n/routing';
import Navigation from '../../components/Navigation';

<<<<<<< HEAD
export async function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export const dynamicParams = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('LocaleLayout');
  const formatter = await getFormatter();
  const now = await getNow();
  const timeZone = await getTimeZone();
=======
type Props = {
  children: ReactNode;
  params: Promise<{locale: Locale}>;
};

const inter = Inter({subsets: ['latin']});

export async function generateMetadata(
  props: Omit<Props, 'children'>
): Promise<Metadata> {
  const params = await props.params;
  const {locale} = params;

  const t = await getTranslations({locale, namespace: 'LocaleLayout'});
  const formatter = await getFormatter({locale});
  const now = await getNow({locale});
  const timeZone = await getTimeZone({locale});
>>>>>>> origin/v4

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

<<<<<<< HEAD
type Props = {
  children: ReactNode;
};

export default function LocaleLayout({children}: Props) {
  const locale = useLocale();
=======
export default async function LocaleLayout({params, children}: Props) {
  const {locale} = await params;

  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
>>>>>>> origin/v4

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
