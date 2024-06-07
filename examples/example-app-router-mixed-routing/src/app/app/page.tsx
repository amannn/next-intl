import {useTranslations} from 'next-intl';
import PageTitle from '@/components/PageTitle';

export default function App() {
  const t = useTranslations('App');
  return <PageTitle>{t('title')}</PageTitle>;
}
