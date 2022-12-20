import {NextIntlServerProvider} from 'next-intl/server';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  params: {locale: string};
};

export default async function LocaleLayout({
  children,
  params: {locale}
}: Props) {
  return (
    <NextIntlServerProvider locale={locale}>{children}</NextIntlServerProvider>
  );
}
