'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

export default function LayoutTemplateTemplate({
  children
}: LayoutProps<'/layout-template'>) {
  const t = useExtracted();
  return (
    <ClientBoundary debug={false}>
      <div>
        <p>{t('Layout template template')}</p>
        {children}
      </div>
    </ClientBoundary>
  );
}
