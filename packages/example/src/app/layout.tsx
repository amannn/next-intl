import acceptLanguageParser from 'accept-language-parser';
import {NextIntlProvider} from 'next-intl';
import {headers} from 'next/headers';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
};

export function resolveLocale(requestHeaders: Headers) {
  const supportedLanguages = ['en', 'de'];
  const defaultLangauge = supportedLanguages[0];
  const locale =
    acceptLanguageParser.pick(
      supportedLanguages,
      requestHeaders.get('accept-language') || defaultLangauge
    ) || defaultLangauge;

  return locale;
}

export default function RootLayout({children}: Props) {
  const locale = resolveLocale(headers());

  return (
    <html lang="en">
      <head>
        <title>next-intl example</title>
      </head>
      <body>
        <NextIntlProvider locale={locale}>{children}</NextIntlProvider>
      </body>
    </html>
  );
}
