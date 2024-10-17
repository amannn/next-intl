import {Metadata} from 'next';
import {Inter} from 'next/font/google';
import {notFound} from 'next/navigation';
import {
  getFormatter,
  getNow,
  getTimeZone,
  getTranslations
} from 'next-intl/server';
import {ReactNode} from 'react';
import Navigation from '../../components/Navigation';
import {routing} from '@/i18n/routing';

type Props = {
  children: ReactNode;
  params: Promise<{locale: string}>;
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

  return {
    metadataBase: new URL('http://localhost:3000'),
    title: t('title'),
    description: t('description'),
    other: {
      currentYear: formatter.dateTime(now, {year: 'numeric'}),
      timeZone: timeZone || 'N/A'
    }
  };
}

export default async function LocaleLayout(props: Props) {
  const params = await props.params;
  const {locale} = params;
  const {children} = props;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

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
          <Navigation />
          {children}
        </div>
      </body>
    </html>
  );
}
