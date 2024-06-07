import PageTitle from '@/components/PageTitle';
import {useTranslations} from 'next-intl';

export default function About() {
  const t = useTranslations('About');
  return <PageTitle>{t('title')}</PageTitle>;
}
