import {Link, useLocale, useTranslations} from 'next-intl';
import LocaleSwitcher from '../../components/LocaleSwitcher';
import PageLayout from '../../components/PageLayout';

export default function Index() {
  const t = useTranslations('Index');
  const locale = useLocale();

  return (
    <PageLayout title={t('title')}>
      <p>{t('description')}</p>
      <LocaleSwitcher />
      <p>
        <Link href="/about" locale={locale}>
          {t('navigateToAbout')}
        </Link>
      </p>
    </PageLayout>
  );
}
