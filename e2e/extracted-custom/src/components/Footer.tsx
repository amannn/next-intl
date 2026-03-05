'use client';

import {useExtracted} from 'next-intl';

export default function Footer() {
  const t = useExtracted();
  return <footer>{t('Hey!')}</footer>;
}
