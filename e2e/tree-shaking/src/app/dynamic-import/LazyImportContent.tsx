'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

export default function LazyImportContent() {
  const t = useExtracted();
  return (
    <ClientBoundary>
      <p>{t('Lazy imported client')}</p>
    </ClientBoundary>
  );
}
