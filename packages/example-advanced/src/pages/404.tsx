import pick from 'lodash/pick';
import {GetStaticPropsContext} from 'next';
import {useTranslations} from 'next-intl';
import PageLayout from '../components/PageLayout';

export default function NotFound() {
  const t = useTranslations('NotFound');
  return <PageLayout title={t('title')} />;
}

NotFound.messages = ['NotFound', ...PageLayout.messages];

export async function getStaticProps({locale}: GetStaticPropsContext) {
  return {
    props: {
      messages: pick(
        await import(`../../messages/${locale}.json`),
        NotFound.messages
      )
    }
  };
}
