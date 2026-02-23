'use client';

import ClientBoundary from '@/components/ClientBoundary';
import {useExtracted} from 'next-intl';

export default function MultiProviderOneContent() {
  const t = useExtracted();
  return (
    <ClientBoundary>
      <p>{t('Multi provider one')}</p>
    </ClientBoundary>
  );
}
