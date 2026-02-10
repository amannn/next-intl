'use client';

import {useExtracted} from 'next-intl';

export default function LayoutTemplatePage() {
  const t = useExtracted();
  return <p>{t('Layout template page')}</p>;
}
