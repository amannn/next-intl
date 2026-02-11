'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

export default function FeedPage() {
  const t = useExtracted();
  return (
    <ClientBoundary>
      <p>{t('Feed page')}</p>
    </ClientBoundary>
  );
}
