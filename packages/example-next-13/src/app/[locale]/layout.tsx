import {NextIntlProvider} from 'next-intl';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  params: {locale: string};
};

export default async function LocaleLayout({
  children,
  params: {locale}
}: Props) {
  const messages = (await import(`../../../messages/${locale}.json`)).default;

  return (
    <NextIntlProvider locale={locale} messages={messages}>
      {children}
    </NextIntlProvider>
  );
}
