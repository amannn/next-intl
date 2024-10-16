'use client';

import {useTranslations} from 'next-intl';
import PageLayout from '@/components/PageLayout';

export default function Secret() {
  const t = useTranslations('Secret');

  return (
    <PageLayout title={t('title')}>
      <p>{t('description')}</p>
    </PageLayout>
  );
}
