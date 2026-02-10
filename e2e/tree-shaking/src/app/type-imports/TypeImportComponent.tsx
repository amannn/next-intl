'use client';

import {useExtracted} from 'next-intl';
import type {Test} from './page';

export default function TypeImportComponent() {
  const t = useExtracted();

  const test: Test = 'test';

  return (
    <section>
      <h2>{t('Test label: {value}', {value: test})}</h2>
    </section>
  );
}
