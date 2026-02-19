'use client';

import {useExtracted} from 'next-intl';
import {use} from 'react';
import ClientBoundary from '@/components/ClientBoundary';

type Props = {
  params: Promise<{parts: Array<string>}>;
};

export default function CatchAllPageContent({params}: Props) {
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
