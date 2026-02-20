import DebugMessages from '@/components/DebugMessages';
import {getExtracted} from 'next-intl/server';
import {NextIntlClientProvider} from 'next-intl';

export const dynamic = 'force-dynamic';

export default async function LoadingPage() {
  const t = await getExtracted();
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return (
    <NextIntlClientProvider messages="infer">
      <DebugMessages />
      <p>{t('Static page')}</p>
    </NextIntlClientProvider>
  );
}
