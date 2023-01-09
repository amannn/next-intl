import {useLocale} from 'next-intl';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
};

export default async function LocaleLayout({children}: Props) {
  const locale = useLocale();
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
