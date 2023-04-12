import {useLocale} from 'next-intl';
import {getTranslations} from 'next-intl/server';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
  params: {locale: string};
};

export async function generateMetadata() {
  // You can use the core (non-React) APIs when you have to use next-intl
  // outside of components. Potentially this will be simplified in the future
  // (see https://next-intl-docs.vercel.app/docs/next-13/server-components).
  const t = await getTranslations();

  return {
    title: t('LocaleLayout.title')
  };
}

export default async function LocaleLayout({children}: Props) {
  const locale = useLocale();
  return (
    <html lang={locale}>
      <head>
        <title>next-intl</title>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </head>
      <body>{children}</body>
    </html>
  );
}
