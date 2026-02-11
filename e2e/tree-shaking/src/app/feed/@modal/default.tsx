'use client';

import ClientBoundary from '@/components/ClientBoundary';
import {useExtracted} from 'next-intl';

export default function FeedModalDefault() {
  const t = useExtracted();
  return (
    <ClientBoundary>
      <p>{t('Feed modal default')}</p>
    </ClientBoundary>
  );
}
