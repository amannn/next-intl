'use client';
import {NextIntlProvider} from 'next-intl';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  locale: string;
};

export default function Provider({children, locale}: Props) {
  console.log('Provider');

  // return children;
  return <NextIntlProvider locale={locale}>{children}</NextIntlProvider>;
}
