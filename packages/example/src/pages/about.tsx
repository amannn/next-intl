import {parseISO} from 'date-fns';
import {pick} from 'lodash';
import {GetServerSidePropsContext} from 'next';
import {useIntl, useTranslations} from 'next-intl';
import {useRouter} from 'next/router';
import Code from '../components/Code';
import PageLayout from '../components/PageLayout';

export default function About() {
  const t = useTranslations('About');
  const {locale} = useRouter();
  const intl = useIntl();
  const lastUpdated = parseISO('2021-10-28T10:04:45.567Z');

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

About.messages = ['About', ...PageLayout.messages];

export async function getServerSideProps({locale}: GetServerSidePropsContext) {
  return {
    props: {
      messages: pick(
        await import(`../../messages/${locale}.json`),
        About.messages
      ),
      // Note that when `now` is passed to the app, you need to make sure the
      // value is updated from time to time, so relative times are updated. See
      // https://github.com/amannn/next-intl/blob/main/docs/usage.md#formatrelativetime
      now: new Date().getTime()
    }
  };
}
