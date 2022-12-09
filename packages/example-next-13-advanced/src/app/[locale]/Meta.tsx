import {useTranslations} from 'next-intl';

export default function Meta() {
  const t = useTranslations('Meta');
  return (
    <>
      <title>{t('title')}</title>
      <meta content={t('description')} name="description" />
    </>
  );
}
