import PlaygroundByline from '@/components/PlaygroundByline';
import PlaygroundSidebar from '@/components/PlaygroundSidebar';
import {routing} from '@/i18n/routing';
import clsx from 'clsx';
import {NextIntlClientProvider} from 'next-intl';
import {getExtracted, getLocale} from 'next-intl/server';
import {ThemeProvider} from 'next-themes';
import {Inter} from 'next/font/google';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
});

export async function generateMetadata() {
  const t = await getExtracted();
  return {
    title: t('next-intl playground'),
    description: t(
      'Explore translations, formatting, routing and patterns with next-intl.'
    )
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children
}: LayoutProps<'/[locale]'>) {
  const locale = await getLocale();

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
              <div className="mx-auto flex min-h-dvh max-w-4xl flex-col px-4 pt-16 pb-10 sm:px-6 lg:px-8 lg:pt-10">
                <div className="flex-1">{children}</div>
                <PlaygroundByline />
              </div>
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
