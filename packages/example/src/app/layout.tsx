import acceptLanguageParser from 'accept-language-parser';
import {headers} from 'next/headers';
import {ReactNode} from 'react';
// import Provider from './Provider';
import ServerOnlyContext from './ServerOnlyContext';

type Props = {
  children: ReactNode;
};

function resolveLocale(requestHeaders: Headers) {
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

  console.log(ServerOnlyContext);

  return (
    <html lang={locale}>
      <head>
        <title>next-intl example</title>
      </head>
      <body>
        <ServerOnlyContext.Provider value={{only: {for: {server: 42}}}}>
          {/* <Provider locale={locale}> */}
          {children}
          {/* </Provider> */}
        </ServerOnlyContext.Provider>
      </body>
    </html>
  );
}
