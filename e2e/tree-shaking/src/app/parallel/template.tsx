'use client';

import {useExtracted} from 'next-intl';

export default function ParallelTemplate({children}: LayoutProps<'/parallel'>) {
  const t = useExtracted();
  return (
    <section>
      <p>{t('Parallel template')}</p>
      {children}
    </section>
  );
}
