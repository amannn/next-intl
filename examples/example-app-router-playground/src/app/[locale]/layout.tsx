import {Metadata} from 'next';
import {Inter} from 'next/font/google';
import {notFound} from 'next/navigation';
import {Locale, NextIntlClientProvider, hasLocale} from 'next-intl';
import {
  getFormatter,
  getNow,
  getTimeZone,
  getTranslations,
  setRequestLocale
} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import Navigation from '../../components/Navigation';

const inter = Inter({subsets: ['latin']});

export async function generateMetadata(
  props: Omit<LayoutProps<'/[locale]'>, 'children'>
): Promise<Metadata> {
  const {locale} = await props.params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const localeTyped = locale as Locale;

  const t = await getTranslations({locale: localeTyped, namespace: 'LocaleLayout'});
  const formatter = await getFormatter({locale: localeTyped});
  const now = await getNow({locale: localeTyped});
  const timeZone = await getTimeZone({locale: localeTyped});

  const base = new URL('http://localhost:3000');
  if (process.env.NEXT_PUBLIC_USE_CASE === 'base-path') {
    base.pathname = '/base/path';
  }

  return {
    metadataBase: base,
    title: t('title'),
    description: t('description'),
    other: {
      currentYear: formatter.dateTime(now, {year: 'numeric'}),
      timeZone
    }
  };
}

export default async function LocaleLayout({
  children,
  params
}: LayoutProps<'/[locale]'>) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

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
