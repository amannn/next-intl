import {useFormatter, useNow, useTranslations} from 'use-intl';
import PageLayout from '../components/PageLayout';

export default function Index() {
  const t = useTranslations('Index');
  const format = useFormatter();
  const now = useNow();

  return (
    <PageLayout title={t('title')}>
      <p>{t('description')}</p>
      <p>{format.dateTime(now)}</p>
    </PageLayout>
  );
}

export async function getStaticProps(context) {
  return {
    props: {
      now: new Date().toISOString(),
      // You can get the messages from anywhere you like. The recommended
      // pattern is to put them in JSON files separated by locale and read
      // the desired one based on the `locale` received from Next.js.
      messages: (await import(`../../messages/${context.locale}.json`)).default
    }
  };
}
