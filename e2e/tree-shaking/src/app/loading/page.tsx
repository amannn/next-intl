import {getExtracted} from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function LoadingPage() {
  const t = await getExtracted();
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return <p>{t('Static page')}</p>;
}
