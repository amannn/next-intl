'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

export default function HmrTestContent() {
  const t = useExtracted();
  return (
    <ClientBoundary>
      <p>{t('HMR test initial')}</p>
    </ClientBoundary>
  );
}
