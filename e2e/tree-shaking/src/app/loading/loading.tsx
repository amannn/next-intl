'use client';

import {useExtracted} from 'next-intl';

export default function Loading() {
  const t = useExtracted();
  return <p>{t('Loading page …')}</p>;
}
