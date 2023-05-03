import {notFound} from 'next/navigation';
import {createTranslator, NextIntlClientProvider} from 'next-intl';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  params: {locale: string};
};

export async function generateMetadata({params: {locale}}: Props) {
  const messages = (await import(`../../../messages/${locale}.json`)).default;

  // You can use the core (non-React) APIs when you have to use next-intl
  // outside of components. Potentially this will be simplified in the future
  // (see https://next-intl-docs.vercel.app/docs/next-13/server-components).
  const t = createTranslator({locale, messages});

  return {
    title: t('LocaleLayout.title')
  };
}

export default async function LocaleLayout({
  children,
  params: {locale}
}: Props) {
  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
