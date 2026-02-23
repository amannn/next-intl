import {NextIntlClientProvider, useExtracted} from 'next-intl';

export default function ParallelTeamDefault() {
  const t = useExtracted();
  return (
    <NextIntlClientProvider messages="infer">
      <p>{t('Parallel team default (server)')}</p>
    </NextIntlClientProvider>
  );
}
