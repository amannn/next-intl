'use client';

import {useExtracted} from 'next-intl';

export default function LayoutTemplateTemplate({
  children
}: LayoutProps<'/layout-template'>) {
  const t = useExtracted();
  return (
    <div>
      <p>{t('Layout template template')}</p>
      {children}
    </div>
  );
}
