'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

export default function ParallelActivityPageContent() {
  const t = useExtracted();
  return (
    <ClientBoundary>
      <p>{t('Parallel activity page (client)')}</p>
    </ClientBoundary>
  );
}
