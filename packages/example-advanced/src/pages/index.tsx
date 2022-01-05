import pick from 'lodash/pick';
import {GetStaticPropsContext} from 'next';
import {useTranslations} from 'next-intl';
import {useRouter} from 'next/router';
import Code from 'components/Code';
import PageLayout from 'components/PageLayout';

export default function Index() {
  const t = useTranslations('Index');
  const {locale} = useRouter();

  return (
    <PageLayout title={t('title')}>
      <div>
        {t.rich('description', {
          locale,
          p: (children) => <p>{children}</p>,
          code: (children) => <Code>{children}</Code>
        })}
      </div>
      <ul>
        {Index.messages.map((componentName) => (
          <li key={componentName} style={{marginBottom: 5}}>
            <Code>{componentName}</Code>
          </li>
        ))}
      </ul>
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
