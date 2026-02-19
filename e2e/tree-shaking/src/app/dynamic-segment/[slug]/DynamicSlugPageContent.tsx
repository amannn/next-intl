'use client';

import {useExtracted} from 'next-intl';
import {use} from 'react';
import ClientBoundary from '@/components/ClientBoundary';

type Props = {
  params: Promise<{slug: string}>;
};

export default function DynamicSlugPageContent({params}: Props) {
  const {slug} = use(params);
  const t = useExtracted();

  return (
    <ClientBoundary>
      <div>
        <p>{t('Dynamic slug page: {slug}', {slug})}</p>
      </div>
    </ClientBoundary>
  );
}
