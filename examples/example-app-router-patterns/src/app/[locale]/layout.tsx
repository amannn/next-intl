import {PlaygroundByline} from '@/components/PlaygroundByline';
import {PlaygroundSidebar} from '@/components/PlaygroundSidebar';
import {routing} from '@/i18n/routing';
import clsx from 'clsx';
import type {Metadata} from 'next';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {ThemeProvider} from 'next-themes';
import {Inter} from 'next/font/google';
import {notFound} from 'next/navigation';
import type {ReactNode} from 'react';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'next-intl playground',
  description:
    'Explore translations, formatting, routing and patterns with next-intl.'
};

type Props = {
  children: ReactNode;
  params: Promise<{locale: string}>;
};

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html lang={locale} suppressHydrationWarning className={inter.variable}>
      <body
        className={clsx(
          inter.className,
          'bg-gray-50 text-gray-900 antialiased dark:bg-gray-900 dark:text-gray-50'
        )}
      >
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <PlaygroundSidebar />
            <div className="lg:pl-72">
              <div className="mx-auto mt-16 mb-24 max-w-4xl px-4 sm:px-6 lg:mt-0 lg:px-8 lg:py-10">
                {children}
                <PlaygroundByline />
              </div>
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
