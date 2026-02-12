'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

export default function GroupOnePage() {
  const t = useExtracted();
  return (
    <ClientBoundary>
      <div>
        <p>{t('Group (one) page')}</p>
      </div>
    </ClientBoundary>
  );
}
