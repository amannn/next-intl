'use client';

import {useExtracted} from 'next-intl';

export default function ParallelActivityPage() {
  const t = useExtracted();
  return <p>{t('Parallel activity page (client)')}</p>;
}
