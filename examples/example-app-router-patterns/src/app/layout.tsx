import {clsx} from 'clsx';
import type {Metadata} from 'next';
import {NextIntlClientProvider} from 'next-intl';
import {getLocale} from 'next-intl/server';
import {ThemeProvider} from 'next-themes';
import {Inter} from 'next/font/google';
import type {ReactNode} from 'react';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'next-intl playground',
  description:
    'Explore translations, formatting, routing and patterns with next-intl.'
};

export default async function RootLayout({children}: {children: ReactNode}) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning className={inter.variable}>
      <body className={clsx(inter.className, 'antialiased')}>
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
