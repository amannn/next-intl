'use client';

import ClientBoundary from '@/components/ClientBoundary';
import {useExtracted} from 'next-intl';

export default function LazyImportContent() {
  const t = useExtracted();
  return (
    <ClientBoundary>
      <p>{t('Lazy imported client')}</p>
    </ClientBoundary>
  );
}
