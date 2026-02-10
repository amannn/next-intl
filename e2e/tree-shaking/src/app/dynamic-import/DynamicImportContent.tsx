'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

export default function DynamicImportContent() {
  const t = useExtracted();
  return (
    <ClientBoundary>
      <p>{t('Dynamic imported client')}</p>
    </ClientBoundary>
  );
}
