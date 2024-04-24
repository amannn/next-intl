import {NextIntlClientProvider, useLocale} from 'next-intl';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
};

export default function LocaleLayout({children}: Props) {
  const locale = useLocale();

  return (
    <html lang={locale}>
      <head>
        <title>next-intl</title>
      </head>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
