'use client';

import {useExtracted} from 'next-intl';

export default function LazyImportContent() {
  const t = useExtracted();
  return <p>{t('Lazy imported client')}</p>;
}
