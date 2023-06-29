import {ReactNode} from 'react';
import {useLocale, useLanguageDirection} from 'next-intl';

type Props = {
  children: ReactNode;
};

export default function Layout({children}: Props) {
  const locale = useLocale();
  const direction = useLanguageDirection(locale); // 'ltr' or 'rtl'

  return (
    <html lang={locale} dir={direction}>
      <body>{children}</body>
    </html>
  );
}
