import {useLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  params: {locale: string};
};

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
