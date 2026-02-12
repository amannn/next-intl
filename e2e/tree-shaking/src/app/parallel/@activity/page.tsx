'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

export default function ParallelActivityPage() {
  const t = useExtracted();
  return (
    <ClientBoundary debug={false}>
      <p>{t('Parallel activity page (client)')}</p>
    </ClientBoundary>
  );
}
