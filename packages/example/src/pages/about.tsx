import {parseISO} from 'date-fns';
import {GetStaticPropsContext} from 'next';
import {useIntl, useTranslations} from 'next-intl';
import {useRouter} from 'next/router';
import Code from '../components/Code';
import PageLayout from '../components/PageLayout';

export default function About() {
  const t = useTranslations('About');
  const {locale} = useRouter();
  const intl = useIntl();
  const lastUpdated = parseISO('2021-01-26T17:04:45.567Z');

  return (
    <PageLayout title={t('title')}>
      <p>
        {t.rich('description', {
          locale,
          code: (children) => <Code>{children}</Code>
        })}
      </p>
      <p>
        {t.rich('lastUpdated', {
          lastUpdated,
          lastUpdatedRelative: intl.formatRelativeTime(lastUpdated)
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
      },
      now: new Date().getTime()
    }
  };
}
