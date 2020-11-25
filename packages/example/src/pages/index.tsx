import {useTranslations} from 'next-intl';

export default function Index() {
  const t = useTranslations('Index');

  return (
    <div>
      <h1>{t('hello', {name: 'Jane'})}</h1>
    </div>
  );
}
