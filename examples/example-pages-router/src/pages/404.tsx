import {GetStaticPropsContext} from 'next';
import {useTranslations} from 'next-intl';

export default function NotFound() {
  const t = useTranslations('NotFound');
  return <p>{t('title')}</p>;
}

export async function getStaticProps({locale}: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../messages/${locale}.json`)).default
    }
  };
}
