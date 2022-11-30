'use client';

import {NextIntlProvider} from 'next-intl';
import {use, ReactNode} from 'react';

type Props = {
  children: ReactNode;
  params: {locale: string};
};

export default function LocaleLayout({children, params: {locale}}: Props) {
  const messages = use(import(`../../../messages/${locale}.json`));

  return (
    <NextIntlProvider locale={locale} messages={messages}>
      {children}
    </NextIntlProvider>
  );
}
