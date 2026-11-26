import {useTranslations} from 'next-intl';

export default function IndexPage() {
  const t = useTranslations('IndexPage');
  return <h1>{t('title')}</h1>;
}
