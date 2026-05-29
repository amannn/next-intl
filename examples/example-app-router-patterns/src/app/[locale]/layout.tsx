import {PlaygroundByline} from '@/components/playground/byline';
import {PlaygroundSidebar} from '@/components/playground/sidebar';
import {routing} from '@/i18n/routing';
import {hasLocale} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import type {ReactNode} from 'react';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

type Props = {
  children: ReactNode;
  params: Promise<{locale: string}>;
};

export default async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <>
      <PlaygroundSidebar />
      <div className="lg:pl-72">
        <div className="mx-auto mt-16 mb-24 max-w-4xl px-4 sm:px-6 lg:mt-0 lg:px-8 lg:py-10">
          {children}
          <PlaygroundByline />
        </div>
      </div>
    </>
  );
}
