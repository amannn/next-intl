import {useExtracted} from 'next-intl';

export default function ActionComponent() {
  const t = useExtracted();
  return <p>{t('ActionComponent')}</p>;
}
