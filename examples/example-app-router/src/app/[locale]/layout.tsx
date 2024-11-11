import {notFound} from 'next/navigation';
import {Locale, hasLocale} from 'next-intl';
import {getTranslations} from 'next-intl/server';
import {ReactNode, Suspense} from 'react';
import BaseLayout from '@/components/BaseLayout';
import {routing} from '@/i18n/routing';

type Props = {
  children: ReactNode;
  params: Promise<{locale: Locale}>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({params}: Omit<Props, 'children'>) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'LocaleLayout'});

  return {
    title: t('title')
  };
}

export default function LocaleLayoutMain(props: Props) {
  return (
    <Suspense
      fallback={
        <html lang="en">
          <body>
            <div>Loading …</div>
          </body>
        </html>
      }
    >
      <LocaleLayout {...props} />
    </Suspense>
  );
}

async function LocaleLayout({children, params}: Props) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return <BaseLayout locale={locale}>{children}</BaseLayout>;
}
