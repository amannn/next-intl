import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getExtracted} from 'next-intl/server';
import {ReactNode} from 'react';
import {Inter} from 'next/font/google';
import Navigation from './Navigation';
import './globals.css';

const inter = Inter({subsets: ['latin']});

type Props = {
  children: ReactNode;
};

export async function generateMetadata() {
  const t = await getExtracted();
  return {
    title: t({
      message: 'next-intl example',
      description: 'Default meta title if not overridden by pages'
    })
  };
}

export default async function LocaleLayout({children}: Props) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body className={`${inter.className} flex flex-col gap-2.5`}>
        <NextIntlClientProvider messages="infer" temp_segment="/">
          <Navigation />
          <div className="p-4 flex flex-col gap-4">
            <div>{children}</div>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
