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
      <p>{t('An error occurred')}</p>
      <p>{error.message}</p>
      <button onClick={reset} type="button">
        {t('Retry')}
      </button>
    </ClientBoundary>
  );
}
