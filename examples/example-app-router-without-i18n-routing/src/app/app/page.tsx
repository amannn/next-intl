import {useTranslations} from 'next-intl';

export default function HomePage() {
  const t = useTranslations('HomePage');
  return (
    <h1 className="text-4xl font-semibold tracking-tight">{t('title')}</h1>
  );
}
