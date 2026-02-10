'use client';

import {useExtracted} from 'next-intl';
import {use} from 'react';

export default function CatchAllPage({
  params
}: PageProps<'/catch-all/[...parts]'>) {
  const t = useExtracted();
  const {parts} = use(params);
  const segment = parts.join('/');

  return (
    <div>
      <p>{t('Catch-all page: {segment}', {segment})}</p>
    </div>
  );
}
