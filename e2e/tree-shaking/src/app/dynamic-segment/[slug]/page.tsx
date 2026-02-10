'use client';

import {useExtracted} from 'next-intl';
import {use} from 'react';

export default function DynamicSlugPage({
  params
}: PageProps<'/dynamic-segment/[slug]'>) {
  const {slug} = use(params);
  const t = useExtracted();

  return (
    <div>
      <p>{t('Dynamic slug page: {slug}', {slug})}</p>
    </div>
  );
}
