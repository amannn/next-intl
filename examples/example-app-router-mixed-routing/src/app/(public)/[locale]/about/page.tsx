import {useTranslations} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import PageTitle from '@/components/PageTitle';

type Props = {
  params: {locale: string};
};

export default function About({params: {locale}}: Props) {
  // Enable static rendering
  setRequestLocale(locale);

  const t = useTranslations('About');
  return <PageTitle>{t('title')}</PageTitle>;
}
