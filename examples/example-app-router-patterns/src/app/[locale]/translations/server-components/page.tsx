import Code from '@/components/Code';
import GitHubLink from '@/components/GitHubLink';
import PlaygroundBoundary from '@/components/PlaygroundBoundary';
import Prose from '@/components/Prose';
import {docsUrl} from '@/config';
import {useExtracted} from 'next-intl';
import AsyncIndexPage from './AsyncIndexPage';
import IndexPage from './IndexPage';

const asyncSample = `import {getTranslations} from 'next-intl/server';

export default async function IndexPage() {
  // !mark
  const t = await getTranslations('IndexPage');
  return <h1>{t('title')}</h1>;
}`;

const nonAsyncSample = `import {useTranslations} from 'next-intl';

export default function IndexPage() {
  // !mark
  const t = useTranslations('IndexPage');
  return <h1>{t('title')}</h1>;
}`;

export default function ServerComponentsPage() {
  const t = useExtracted();

  return (
    <div>
      <header className="mb-6">
        <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-gray-600 uppercase dark:text-gray-300">
          {t('Translations')}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 sm:text-[28px] dark:text-gray-50">
          {t('Server Components')}
        </h1>
      </header>

      <Prose>
        <p>
          {t(
            'Translations in Server Components are resolved on the server side.'
          )}
        </p>

        <h3>{t('Async components')}</h3>
        <p>
          {t.rich(
            'In async Server Components, use <code>await getTranslations</code> to read messages.',
            {
              code: (chunks) => (
                <a
                  href={`${docsUrl}/environments/server-client-components#async-components`}
                >
                  <code>{chunks}</code>
                </a>
              )
            }
          )}
        </p>
        <Code value={asyncSample} label={t('Code')} />
        <PlaygroundBoundary label={t('Output')} variant="dotgrid">
          <AsyncIndexPage />
        </PlaygroundBoundary>

        <h3>{t('Non-async components')}</h3>
        <p>
          {t.rich(
            'In non-async Server Components, <code>useTranslations</code> can be called as a hook.',
            {
              code: (chunks) => (
                <a
                  href={`${docsUrl}/environments/server-client-components#shared-components`}
                >
                  <code>{chunks}</code>
                </a>
              )
            }
          )}
        </p>
        <Code value={nonAsyncSample} label={t('Code')} />
        <PlaygroundBoundary label={t('Output')} variant="dotgrid">
          <IndexPage />
        </PlaygroundBoundary>
      </Prose>

      <div className="mt-6 flex justify-end">
        <GitHubLink path="src/app/[locale]/translations/server-components" />
      </div>
    </div>
  );
}
