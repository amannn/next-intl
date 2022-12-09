import {ReactNode} from 'react';
import NextIntlProvider from './NextIntlProvider';

type Props = {
  children: ReactNode;
  params: {locale: string};
};

export default async function LocaleLayout({
  children,
  params: {locale}
}: Props) {
  // @ts-expect-error Waiting for TypeScript to support Server Components
  return <NextIntlProvider locale={locale}>{children}</NextIntlProvider>;
}
