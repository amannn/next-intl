import {Metadata} from 'next';
import {Inter} from 'next/font/google';
import {
  getFormatter,
  getNow,
  getTimeZone,
  getTranslations
} from 'next-intl/server';
import {ReactNode} from 'react';
import Navigation from '../../components/Navigation';

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
