'use client';

import {useExtracted} from 'next-intl';

export default function ParallelActivityDefault() {
  const t = useExtracted();
  return <p>{t('Parallel activity default (client)')}</p>;
}
