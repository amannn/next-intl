'use client';

import {useExtracted} from 'next-intl';

export default function GroupOnePage() {
  const t = useExtracted();
  return (
    <div>
      <p>{t('Group (one) page')}</p>
    </div>
  );
}
