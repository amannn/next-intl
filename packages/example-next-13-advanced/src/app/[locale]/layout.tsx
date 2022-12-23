import {ReactNode} from 'react';
import i18n from '../../i18n';
import NextIntlProvider from './NextIntlProvider';

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
        <NextIntlProvider locale={locale}>{children}</NextIntlProvider>
      </body>
    </html>
  );
}
