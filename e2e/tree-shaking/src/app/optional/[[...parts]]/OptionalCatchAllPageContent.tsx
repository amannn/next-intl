'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

type Props = {
  parts?: Array<string>;
};

export default function OptionalCatchAllPageContent({parts}: Props) {
  const t = useExtracted();
  const segment = parts?.join('/') ?? '(empty)';

  return (
    <ClientBoundary>
      <div>
        <p>{t('Optional catch-all page: {segment}', {segment})}</p>
      </div>
    </ClientBoundary>
  );
}
