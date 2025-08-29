import {GetStaticPropsContext} from 'next';
import {useTranslations} from 'next-intl';
import PageLayout from '@/components/PageLayout';
import {Link} from '@/i18n/navigation';

export default function About() {
  const t = useTranslations('About');

  return (
    <PageLayout title={t('title')}>
      <p>{t('description')}</p>
      <Link href="/">{t('navigateToHome')}</Link>
    </PageLayout>
  );
}

export async function getStaticProps({params}: GetStaticPropsContext) {
  return {
    props: {
      messages: (await import(`../../../messages/${params?.locale}.json`))
        .default
    }
  };
}

export async function getStaticPaths() {
  return {
    paths: [{params: {locale: 'de'}}, {params: {locale: 'en'}}],
    fallback: false
  };
}
