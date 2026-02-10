'use client';

import Link from 'next/link';
import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

export default function FeedPage() {
  const t = useExtracted();
  return (
    <ClientBoundary>
      <div>
        <h2>{t('Feed page')}</h2>
        <Link href="/photo/alpha" className="underline">
          {t('Open /photo/alpha')}
        </Link>
      </div>
    </ClientBoundary>
  );
}
