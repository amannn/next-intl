import {useTranslations} from 'next-intl';
import PageTitle from '@/components/PageTitle';

export default function Profile() {
  const t = useTranslations('Profile');
  return <PageTitle>{t('title')}</PageTitle>;
}
