import PageTitle from '@/components/PageTitle';
import {useTranslations} from 'next-intl';

export default function Profile() {
  const t = useTranslations('Profile');
  return <PageTitle>{t('title')}</PageTitle>;
}
