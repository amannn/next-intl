'use client';

import {useExtracted} from 'next-intl';

export default function UnusedBarrelComponent() {
  const t = useExtracted();
  return <p>{t('Unused barrel component')}</p>;
}
