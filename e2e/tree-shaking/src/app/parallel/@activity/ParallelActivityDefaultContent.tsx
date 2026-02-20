'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

export default function ParallelActivityDefaultContent() {
  const t = useExtracted();
  return (
    <ClientBoundary>
      <p>{t('Parallel activity default (client)')}</p>
    </ClientBoundary>
  );
}
