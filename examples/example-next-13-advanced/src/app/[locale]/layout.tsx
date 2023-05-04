import {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {useLocale} from 'next-intl';
import {getTranslations, getFormatter} from 'next-intl/server';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  params: {locale: string};
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('LocaleLayout');
  const formatter = await getFormatter();

  return {
    title: t('title'),
    description: t('description'),
    other: {
      currentYear: formatter.dateTime(new Date(), {year: 'numeric'})
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
