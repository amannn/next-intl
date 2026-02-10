import {getExtracted} from 'next-intl/server';

export default async function LoadingPage() {
  const t = await getExtracted();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return <p>{t('Static page')}</p>;
}
