import {Inter} from '@next/font/google';
import clsx from 'clsx';
import {useLocale} from 'next-intl';
import {getTranslations} from 'next-intl/server';
import {ReactNode} from 'react';
import Navigation from 'components/Navigation';

const inter = Inter({subsets: ['latin']});

type Props = {
  children: ReactNode;
  params: {locale: string};
};

export async function generateMetadata() {
  const t = await getTranslations();

  return {
    title: t('LocaleLayout.title')
  };
}

export default async function LocaleLayout({children}: Props) {
  const locale = useLocale();
  return (
    <html className="h-full" lang={locale}>
      <body className={clsx(inter.className, 'flex h-full flex-col')}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
