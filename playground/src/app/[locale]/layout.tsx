import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {setRequestLocale, getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import {formats} from '@/i18n/formats';
import {ClientProviders} from '@/components/playground/client-providers';
import {PlaygroundSidebar} from '@/components/playground/sidebar';
import {PlaygroundByline} from '@/components/playground/byline';
import '../globals.css';

const geistSans = Geist({variable: '--font-geist-sans', subsets: ['latin']});
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'next-intl Playground',
  description:
    'Explore translations, formatting, routing, and patterns with next-intl.'
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`font-sans ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
          formats={formats}
        >
          <ClientProviders>
            <PlaygroundSidebar />
            <div className="lg:pl-72">
              <div className="mx-auto mt-16 mb-24 max-w-4xl px-4 sm:px-6 lg:px-8 lg:mt-0 lg:py-10">
                {children}
                <PlaygroundByline />
              </div>
            </div>
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
