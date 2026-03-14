'use client';

import type {ReactNode} from 'react';
import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

type Props = {children: ReactNode};

export default function LayoutTemplateTemplateContent({children}: Props) {
  const t = useExtracted();
  return (
    <ClientBoundary>
      <div>
        <p>{t('Layout template template')}</p>
        {children}
      </div>
    </ClientBoundary>
  );
}
