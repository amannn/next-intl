'use client';

import {useExtracted} from 'next-intl';

export default function GroupTwoPage() {
  const t = useExtracted();
  return (
    <div>
      <p>{t('Group (two) page')}</p>
    </div>
  );
}
