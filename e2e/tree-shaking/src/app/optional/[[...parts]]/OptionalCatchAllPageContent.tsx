'use client';

import {useExtracted} from 'next-intl';
import {use} from 'react';
import ClientBoundary from '@/components/ClientBoundary';

type Props = {
  params: Promise<{parts?: Array<string>}>;
};

export default function OptionalCatchAllPageContent({params}: Props) {
  const t = useExtracted();
  const {parts} = use(params);
  const segment = parts?.join('/') ?? '(empty)';

  return (
    <ClientBoundary>
      <div>
        <p>{t('Optional catch-all page: {segment}', {segment})}</p>
      </div>
    </ClientBoundary>
  );
}
