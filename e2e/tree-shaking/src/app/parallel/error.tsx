'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

type Props = {
  error: Error;
  reset: () => void;
};

export default function ParallelError({error, reset}: Props) {
  const t = useExtracted();

  return (
    <ClientBoundary>
      <section>
        <h2>{t('An error occurred')}</h2>
        <p>{error.message}</p>
        <button onClick={reset} type="button">
          {t('Retry')}
        </button>
      </section>
    </ClientBoundary>
  );
}
