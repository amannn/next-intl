import pick from 'lodash/pick';
import {GetStaticPropsContext} from 'next';
import {useTranslations} from 'next-intl';
import {useRouter} from 'next/router';
import Code from '../components/Code';
import PageLayout from '../components/PageLayout';

export default function Index() {
  const t = useTranslations('Index');
  const {locale} = useRouter();

  return (
    <PageLayout title={t('title')}>
      <p>
        {t.rich('description', {
          locale,
          code: (children) => <Code>{children}</Code>
        })}
      </p>
    </PageLayout>
  );
}

// The namespaces can be generated based on used components. `PageLayout` in
// turn requires messages for `Navigation` and therefore a recursive list of
// namespaces is created dynamically, where the owner of a component doesn't
// have to know which nested components are rendered. Note that this approach
// is limited to components which are not lazy loaded.
Index.messages = ['Index', ...PageLayout.messages];

export async function getStaticProps({locale}: GetStaticPropsContext) {
  return {
    props: {
      messages: pick(
        await import(`../../messages/${locale}.json`),
        Index.messages
      )
    }
  };
}
