import {NextIntlServerProvider} from 'next-intl/server';
import {ReactNode} from 'react';
import i18n from '../../i18n';

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({locale}));
}

type Props = {
  children: ReactNode;
  params: {locale: string};
};

export default async function LocaleLayout({
  children,
  params: {locale}
}: Props) {
  return (
    <html lang={locale}>
      <body>
        <NextIntlServerProvider locale={locale}>
          {children}
        </NextIntlServerProvider>
      </body>
    </html>
  );
}
