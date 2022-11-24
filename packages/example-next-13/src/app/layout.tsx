import {ReactNode} from 'react';
import i18n from 'i18n';
import resolveLocale from 'next-intl/server/resolveLocale';

type Props = {
  children: ReactNode;
};

export default function RootLayout({children}: Props) {
  // TODO: Here's a problem: When there's no cookie yet, we can't use the locale
  // from the URL. Something like `require('next/navigation').usePathname()`
  // would be great, but that uses non-server context currently, so not an
  // option in server components. `params` is also not an option, since they are
  // only available from matched segments downwards.
  return (
    <html lang={resolveLocale(i18n)}>
      <body>{children}</body>
    </html>
  );
}
