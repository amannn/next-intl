import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Suspense} from 'react';
import LocaleCookieValue from '@/components/LocaleCookieValue';
import {Link} from '@/i18n/navigation';

export default async function IndexPage({params}: PageProps<'/[locale]'>) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('IndexPage');

  return (
    <main>
      <h1>{t('title')}</h1>
      <Link href="/about">{t('about')}</Link>
      <Link href="/" locale={locale === 'en' ? 'de' : 'en'}>
        {t('switchLocale')}
      </Link>
      <Suspense fallback={<p>Loading …</p>}>
        <LocaleCookieValue />
      </Suspense>
    </main>
  );
}
