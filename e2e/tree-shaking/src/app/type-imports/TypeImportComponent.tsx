'use client';

import {useExtracted} from 'next-intl';
import type {Test} from './page';
import ClientBoundary from '@/components/ClientBoundary';

export default function TypeImportComponent() {
  const t = useExtracted();

  const test: Test = 'test';

  return (
    <ClientBoundary>
      <section>
        <h2>{t('Test label: {value}', {value: test})}</h2>
      </section>
    </ClientBoundary>
  );
}
