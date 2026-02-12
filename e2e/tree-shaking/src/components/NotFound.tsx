'use client';

import {useExtracted} from 'next-intl';
import ClientBoundary from './ClientBoundary';

export default function NotFound() {
  const t = useExtracted('NotFound');
  return (
    <ClientBoundary>
      <p>{t('Page not found')}</p>
    </ClientBoundary>
  );
}
