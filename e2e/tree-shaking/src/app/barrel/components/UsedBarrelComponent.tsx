'use client';

import {useExtracted} from 'next-intl';

export default function UsedBarrelComponent() {
  const t = useExtracted();
  return <p>{t('Used barrel component')}</p>;
}
