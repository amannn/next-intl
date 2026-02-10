'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

export default function LayoutTemplatePage() {
  const t = useExtracted();
  return (
    <ClientBoundary>
      <p>{t('Layout template page')}</p>
    </ClientBoundary>
  );
}
