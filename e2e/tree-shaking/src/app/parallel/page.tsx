'use client';

import {useExtracted} from 'next-intl';

export default function ParallelPage() {
  const t = useExtracted();
  return (
    <div>
      <p>{t('Parallel page')}</p>
    </div>
  );
}
