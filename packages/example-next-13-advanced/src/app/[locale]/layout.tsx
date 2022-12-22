import {ReactNode} from 'react';
import NextIntlProvider from './NextIntlProvider';

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
