import {getTranslations} from 'next-intl/server';

export default async function IndexPage() {
  const t = await getTranslations('IndexPage');
  return <h1>{t('title')}</h1>;
}
