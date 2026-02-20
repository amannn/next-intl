'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

export default function FeedPageContent() {
  const t = useExtracted();
  return (
    <ClientBoundary>
      <p>{t('Feed page')}</p>
    </ClientBoundary>
  );
}
