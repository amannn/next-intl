'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

export default function ExplicitIdPage() {
  const t = useExtracted();

  return (
    <ClientBoundary>
      <p>
        {t({
          id: 'carousel.next',
          message: 'Right'
        })}
      </p>
    </ClientBoundary>
  );
}
