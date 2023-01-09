import {useTranslations} from 'next-intl';

export default function Head() {
  const t = useTranslations('Meta');
  return (
    <>
      <title>{t('title')}</title>
      <meta content={t('description')} name="description" />
      <meta content="width=device-width, initial-scale=1" name="viewport" />
    </>
  );
}
