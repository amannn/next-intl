import PageTitle from '@/components/PageTitle';
import {useTranslations} from 'next-intl';

export default function Index() {
  const t = useTranslations('Index');
  return <PageTitle>{t('title')}</PageTitle>;
}
