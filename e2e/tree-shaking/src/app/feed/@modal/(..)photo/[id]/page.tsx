'use client';

import {use} from 'react';
import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

export default function FeedPhotoModalPage({params}: PageProps<'/photo/[id]'>) {
  const {id} = use(params);
  const t = useExtracted();

  return (
    <ClientBoundary>
      <div>
        <h2>{t('Intercepted photo modal: {id}', {id})}</h2>
      </div>
    </ClientBoundary>
  );
}
