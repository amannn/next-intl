import {Locale, useTranslations} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import PageTitle from '@/components/PageTitle';

type Props = {
  params: {locale: Locale};
};

export default function Index({params: {locale}}: Props) {
  // Enable static rendering
  setRequestLocale(locale);

  const t = useTranslations('Index');
  return <PageTitle>{t('title')}</PageTitle>;
}
