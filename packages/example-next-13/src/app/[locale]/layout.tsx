import {createTranslator, NextIntlClientProvider} from 'next-intl';
import {notFound} from 'next/navigation';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  params: {locale: string};
};

export async function generateMetadata({params: {locale}}: Props) {
  const messages = (await import(`../../../messages/${locale}.json`)).default;

  // Currently you can use the core (non-React) APIs when you
  // have to use next-intl in a Server Component like `Head`.
  // In the future you'll be able to use the React APIs here as
  // well (see https://next-intl-docs.vercel.app/docs/next-13).
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
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
