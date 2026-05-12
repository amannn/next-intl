import {NextIntlClientProvider} from 'next-intl';
import {getLocale} from 'next-intl/server';
import {Inter} from 'next/font/google';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import {cookies} from 'next/headers';
import './globals.css';

const inter = Inter({subsets: ['latin']});

export default async function RootLayout({children}: LayoutProps<'/'>) {
  const locale = await getLocale();

  async function setLocaleAction(locale: string) {
    'use server';
    const store = await cookies();
    store.set('locale', locale);
  }

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <div className="p-4">
          <NextIntlClientProvider>
            {children}
            <LocaleSwitcher setLocaleAction={setLocaleAction} />
          </NextIntlClientProvider>
        </div>
      </body>
    </html>
  );
}
