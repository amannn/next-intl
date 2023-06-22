import {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {useLocale} from 'next-intl';
import {
  getFormatter,
  getNow,
  getTimeZone,
  getTranslator
} from 'next-intl/server';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  params: {locale: string};
};

export async function generateMetadata({
  params
}: Omit<Props, 'children'>): Promise<Metadata> {
  const t = await getTranslator({
    namespace: 'LocaleLayout',
    locale: params.locale
  });
  const formatter = await getFormatter({locale: params.locale});
  const now = await getNow({locale: params.locale});
  const timeZone = await getTimeZone({locale: params.locale});

  return {
    title: t('title'),
    description: t('description'),
    other: {
      currentYear: formatter.dateTime(now, {year: 'numeric'}),
      timeZone: timeZone || 'N/A'
    }
  };
}

export default function LocaleLayout({children, params}: Props) {
  const locale = useLocale();

  // Show a 404 error for unknown locales
  if (params.locale !== locale) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
