import {ReactNode} from 'react';
import Storage from '../utils/Storage';
import ServerOnlyContext from './ServerOnlyContext';

type Props = {
  children: ReactNode;
};

export default function RootLayout({children}: Props) {
  const now = new Date().toISOString();
  Storage.set({now});

  // How to get this from the URL?
  // TODO: Validate locale or redirect to default locale
  const locale = 'en';

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
