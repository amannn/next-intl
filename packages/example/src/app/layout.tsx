import {ReactNode} from 'react';
// import Provider from './Provider';
import ServerOnlyContext from './ServerOnlyContext';

type Props = {
  children: ReactNode;
};

export default function RootLayout({children, ...rest}: Props) {
  console.log(rest);

  // How to get this from the URL?
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
