'use client';

import {useRouter} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {useEffect} from 'react';
import LocaleSwitcher from '../../components/LocaleSwitcher';
import PageLayout from '../../components/PageLayout';

export default function Index() {
  const t = useTranslations('Index');

  const router = useRouter();
  useEffect(() => {
    router.push('de');
  }, [router]);

  return (
    <PageLayout title={t('title')}>
      <p>{t('description')}</p>
      <LocaleSwitcher />
    </PageLayout>
  );
}
