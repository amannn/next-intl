import {useTranslations} from 'next-intl';

export default function Page() {
  const t = useTranslations();
  return <h1>{t('Hello', {name: 'Jane'})}</h1>;
}
