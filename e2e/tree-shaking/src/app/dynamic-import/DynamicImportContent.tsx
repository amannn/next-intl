'use client';

import ClientBoundary from '@/components/ClientBoundary';
import {useExtracted} from 'next-intl';

export default function DynamicImportContent() {
  const t = useExtracted();
  return (
    <ClientBoundary>
      <p>{t('Dynamic imported client')}</p>
    </ClientBoundary>
  );
}
