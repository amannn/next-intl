import {GetStaticPropsContext} from 'next';
import {useTranslations} from 'next-intl';
import Link from 'next/link';
import {useRouter} from 'next/router';
import PageLayout from '../components/PageLayout';

export default function Index() {
  const t = useTranslations('Index');

  const {locale, locales, route} = useRouter();
  const otherLocale = locales?.find((cur) => cur !== locale);

  return (
    <PageLayout title={t('title')}>
      <p>{t('description')}</p>
      <Link href={route} locale={otherLocale}>
        <a>{t('switchLocale', {locale: otherLocale})}</a>
      </Link>
    </PageLayout>
  );
}

export async function getStaticProps({locale}: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../messages/${locale}.json`)).default
    }
  };
}
