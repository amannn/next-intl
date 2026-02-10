'use client';

import {useExtracted} from 'next-intl';
import {use} from 'react';
import ClientBoundary from '@/components/ClientBoundary';

export default function DynamicSlugPage({
  params
}: PageProps<'/dynamic-segment/[slug]'>) {
  const {slug} = use(params);
  const t = useExtracted();

  return (
    <ClientBoundary>
      <div>
        <p>{t('Dynamic slug page: {slug}', {slug})}</p>
      </div>
    </ClientBoundary>
  );
}
