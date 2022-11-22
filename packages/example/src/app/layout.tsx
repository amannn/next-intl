import {headers} from 'next/headers';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
};

export default function RootLayout({children, ...rest}: Props) {
  // console.log(headers());

  // How to get this from the URL?
  // TODO: Validate locale or redirect to default locale
  const locale = 'en';

  return (
    <html lang={locale}>
      <head>
        <title>next-intl example</title>
      </head>
      <body>{children}</body>
    </html>
  );
}
