import {GetStaticPropsContext} from 'next';
import {useTranslations} from 'next-intl';
import {useRouter} from 'next/router';
import Code from '../components/Code';
import PageLayout from '../components/PageLayout';

export default function About() {
  const t = useTranslations('About');
  const {locale} = useRouter();

  return (
    <PageLayout title={t('title')}>
      <p>
        {t('description', {
          locale,
          code: (children) => <Code>{children}</Code>
        })}
      </p>
      <p>
        {t('lastUpdated', {
          lastUpdated: new Date('2021-01-27T15:58:45.567Z')
        })}
      </p>
    </PageLayout>
  );
}

export function getStaticProps({locale}: GetStaticPropsContext) {
  return {
    props: {
      messages: {
        ...require(`../../messages/shared/${locale}.json`),
        ...require(`../../messages/about/${locale}.json`)
      }
    }
  };
}
