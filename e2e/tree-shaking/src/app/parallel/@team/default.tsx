import {useExtracted} from 'next-intl';

export default function ParallelTeamDefault() {
  const t = useExtracted();
  return <p>{t('Parallel team default (server)')}</p>;
}
