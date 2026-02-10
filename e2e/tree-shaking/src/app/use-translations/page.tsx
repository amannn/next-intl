'use client';

import {useTranslations} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

export default function UseTranslationsPage() {
  const t = useTranslations('UseTranslationsPage');
  return (
    <ClientBoundary>
      <p>{t('title')}</p>
      <GlobalNamespace />
      <DynamicKey />
    </ClientBoundary>
  );
}

function GlobalNamespace() {
  const t = useTranslations();
  return <p>{t('GlobalNamespace.title')}</p>;
}

function DynamicKey() {
  const t = useTranslations('DynamicKey');
  const key = 'title';

  return <p>{t(key)}</p>;
}
