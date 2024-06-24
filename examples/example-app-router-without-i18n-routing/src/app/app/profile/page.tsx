import {useTranslations} from 'next-intl';

export default function ProfilePage() {
  const t = useTranslations('ProfilePage');
  return (
    <h1 className="text-4xl font-semibold tracking-tight">{t('title')}</h1>
  );
}
