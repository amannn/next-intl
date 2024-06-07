import PageTitle from '@/components/PageTitle';
import {useTranslations} from 'next-intl';

export default function App() {
  const t = useTranslations('App');
  return <PageTitle>{t('title')}</PageTitle>;
}
