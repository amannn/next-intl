import {NextIntlClientProvider, useExtracted} from 'next-intl';

export default function ParallelTeamPage() {
  const t = useExtracted();
  return (
    <NextIntlClientProvider messages="infer">
      <p>{t('Parallel team page (server)')}</p>
    </NextIntlClientProvider>
  );
}
