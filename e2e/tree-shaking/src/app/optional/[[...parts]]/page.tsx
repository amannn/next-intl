'use client';

import {useExtracted} from 'next-intl';
import {use} from 'react';

export default function OptionalCatchAllPage({
  params
}: PageProps<'/optional/[[...parts]]'>) {
  const t = useExtracted();
  const {parts} = use(params);
  const segment = parts?.join('/') ?? '(empty)';

  return (
    <div>
      <p>{t('Optional catch-all page: {segment}', {segment})}</p>
    </div>
  );
}
