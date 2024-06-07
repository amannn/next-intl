import {useTranslations} from 'next-intl';
import PageTitle from '@/components/PageTitle';

export default function About() {
  const t = useTranslations('About');
  return <PageTitle>{t('title')}</PageTitle>;
}
