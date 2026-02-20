'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

type Props = {
  id: string;
};

export default function PhotoPageContent({id}: Props) {
  const t = useExtracted();

  return (
    <ClientBoundary>
      <p>{t('Photo page: {id}', {id})}</p>
    </ClientBoundary>
  );
}
