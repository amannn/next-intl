import {useTranslations} from 'next-intl';
import PageTitle from '@/components/PageTitle';

export default function Index() {
  const t = useTranslations('Index');
  return <PageTitle>{t('title')}</PageTitle>;
}
