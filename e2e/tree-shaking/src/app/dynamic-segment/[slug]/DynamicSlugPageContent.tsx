'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from '@/components/ClientBoundary';

type Props = {
  slug: string;
};

export default function DynamicSlugPageContent({slug}: Props) {
  const t = useExtracted();

  return (
    <ClientBoundary>
      <div>
        <p>{t('Dynamic slug page: {slug}', {slug})}</p>
      </div>
    </ClientBoundary>
  );
}
