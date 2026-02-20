import {useExtracted} from 'next-intl';

export default function SharedComponent() {
  const t = useExtracted();
  return <p>{t('Shared component')}</p>;
}
