import DebugMessages from '@/components/DebugMessages';
import {getExtracted} from 'next-intl/server';
import {NextIntlClientProvider} from 'next-intl';

export default async function LoadingPage() {
  const t = await getExtracted();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <p>{t('Static page')}</p>
    </NextIntlClientProvider>
  );
}
