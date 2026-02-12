'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

export default function FeedPage() {
  const t = useExtracted();
  return (
    <ClientBoundary debug={false}>
      <p>{t('Feed page')}</p>
    </ClientBoundary>
  );
}
