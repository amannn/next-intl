'use client';

import {useExtracted} from 'next-intl';
import {use} from 'react';
import ClientBoundary from '@/components/ClientBoundary';

export default function CatchAllPage({
  params
}: PageProps<'/catch-all/[...parts]'>) {
  const t = useExtracted();
  const {parts} = use(params);
  const segment = parts.join('/');

  return (
    <ClientBoundary>
      <div>
        <p>{t('Catch-all page: {segment}', {segment})}</p>
      </div>
    </ClientBoundary>
  );
}
