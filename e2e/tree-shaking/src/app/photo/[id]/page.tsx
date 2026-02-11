import ClientBoundary from '@/components/ClientBoundary';
import {useExtracted} from 'next-intl';
import {use} from 'react';

export default function PhotoPage({params}: PageProps<'/photo/[id]'>) {
  const {id} = use(params);
  const t = useExtracted();

  return (
    <ClientBoundary>
      <p>{t('Photo page: {id}', {id})}</p>
    </ClientBoundary>
  );
}
