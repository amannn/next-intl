'use client';

import {useExtracted} from 'next-intl';

type Props = {
  error: Error;
  reset: () => void;
};

export default function ParallelError({error, reset}: Props) {
  const t = useExtracted();

  return (
    <section>
      <h2>{t('An error occurred')}</h2>
      <p>{error.message}</p>
      <button onClick={reset} type="button">
        {t('Retry')}
      </button>
    </section>
  );
}
