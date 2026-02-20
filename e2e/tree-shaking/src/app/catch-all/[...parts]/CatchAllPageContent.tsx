'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

type Props = {
  parts: Array<string>;
};

export default function CatchAllPageContent({parts}: Props) {
  const t = useExtracted();
  const segment = parts.join('/');

  return (
    <ClientBoundary>
      <div>
        <p>{t('Catch-all page: {segment}', {segment})}</p>
      </div>
    </ClientBoundary>
  );
}
