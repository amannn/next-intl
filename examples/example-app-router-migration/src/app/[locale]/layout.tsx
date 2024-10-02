import {notFound} from 'next/navigation';
import {ReactNode} from 'react';
import {routing} from '@/i18n/routing';

type Props = {
  children: ReactNode;
  params: {locale: string};
};

export default async function LocaleLayout({children, params}: Props) {
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(params.locale as any)) {
    notFound();
  }

  return (
    <html lang={params.locale}>
      <head>
        <title>next-intl</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
