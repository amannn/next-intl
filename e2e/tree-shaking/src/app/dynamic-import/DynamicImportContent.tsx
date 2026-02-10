'use client';

import {useExtracted} from 'next-intl';

export default function DynamicImportContent() {
  const t = useExtracted();
  return <p>{t('Dynamic imported client')}</p>;
}
