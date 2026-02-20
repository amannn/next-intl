'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

export default function FeedModalDefaultContent() {
  const t = useExtracted();
  return (
    <ClientBoundary>
      <p>{t('Feed modal default')}</p>
    </ClientBoundary>
  );
}
