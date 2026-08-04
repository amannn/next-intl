import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';

export default async function AboutPage() {
  const t = await getTranslations('AboutPage');

  return (
    <main>
      <h1>{t('title')}</h1>
      <Link href="/">{t('index')}</Link>
    </main>
  );
}
