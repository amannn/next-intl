import {useExtracted} from 'next-intl';

export default function ParallelTeamPage() {
  const t = useExtracted();
  return <p>{t('Parallel team page (server)')}</p>;
}
