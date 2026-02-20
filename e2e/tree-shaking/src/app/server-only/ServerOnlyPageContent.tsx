import {useExtracted} from 'next-intl';

export default function ServerOnlyPageContent() {
  const t = useExtracted();
  return <p>{t('Server-only page')}</p>;
}
