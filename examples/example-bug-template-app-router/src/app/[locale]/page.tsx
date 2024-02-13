import {useTranslations} from 'next-intl';
import {unstable_setRequestLocale} from 'next-intl/server';

type Props = {
  params: {locale: string};
};

export default function IndexPage({params: {locale}}: Props) {
  unstable_setRequestLocale(locale); // (required on StackBlitz)

  const t = useTranslations('IndexPage');
  return <h1>{t('title')}</h1>;
}
