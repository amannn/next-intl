import {useTranslations} from 'next-intl';
import PageLayout from '@/components/PageLayout';

export default function About() {
  const t = useTranslations('About');

  return (
    <PageLayout title={t('title')}>
      <p>{t('description')}</p>
    </PageLayout>
  );
}
