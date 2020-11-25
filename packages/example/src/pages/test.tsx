import {useTranslations} from 'next-intl';
import Navigation from 'components/Navigation';

export default function Test() {
  const t = useTranslations('Test');

  return (
    <div>
      <Navigation />
      <h1>{t('title')}</h1>
    </div>
  );
}
