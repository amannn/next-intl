'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

export default function ParallelPage() {
  const t = useExtracted();
  return (
    <ClientBoundary>
      <div>
        <p>{t('Parallel page')}</p>
      </div>
    </ClientBoundary>
  );
}
