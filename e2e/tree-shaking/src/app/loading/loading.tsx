'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

export default function Loading() {
  const t = useExtracted();
  return (
    <ClientBoundary>
      <p>{t('Loading page …')}</p>
    </ClientBoundary>
  );
}
