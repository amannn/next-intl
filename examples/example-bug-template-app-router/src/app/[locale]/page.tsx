import {useTranslations} from 'next-intl';

type Props = {
  params: {locale: string};
};

export default function IndexPage({params: {locale}}: Props) {
  const t = useTranslations('IndexPage');
  return <h1>{t('title')}</h1>;
}
