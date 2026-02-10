'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

export default function GroupTwoPage() {
  const t = useExtracted();
  return (
    <ClientBoundary>
      <div>
        <p>{t('Group (two) page')}</p>
      </div>
    </ClientBoundary>
  );
}
