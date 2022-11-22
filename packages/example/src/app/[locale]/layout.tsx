import {ReactNode} from 'react';
import NextIntlProvider from 'next-intl/NextIntlProvider';
import Storage from '../../next-intl/IntlStorage';

type Props = {
  children: ReactNode;
  params: {
    locale: string;
  };
};

export default function LocaleLayout({children, params: {locale}}: Props) {
  const now = new Date().toISOString();
  Storage.set({now, locale});

  return <NextIntlProvider locale={locale}>{children}</NextIntlProvider>;
}
