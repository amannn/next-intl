'use client';

import {use} from 'react';
import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

type Props = {
  params: Promise<{id: string}>;
};

export default function FeedPhotoModalPageContent({params}: Props) {
  const {id} = use(params);
  const t = useExtracted();

  return (
    <ClientBoundary>
      <p>{t('Intercepted photo modal: {id}', {id})}</p>
    </ClientBoundary>
  );
}
