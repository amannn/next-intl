'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

export default function ParallelTemplate({children}: LayoutProps<'/parallel'>) {
  const t = useExtracted();
  return (
    <>
      <ClientBoundary>
        <p>{t('Parallel template')}</p>
      </ClientBoundary>
      {children}
    </>
  );
}
