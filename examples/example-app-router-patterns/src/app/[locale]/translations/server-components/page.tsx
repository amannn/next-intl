import {Code} from '@/components/Code';
import {GitHubLink} from '@/components/GitHubLink';
import {PlaygroundBoundary} from '@/components/PlaygroundBoundary';
import {Prose} from '@/components/Prose';
import {useExtracted} from 'next-intl';
import {ServerExample} from './ServerExample';

const asyncSample = `import {getTranslations} from 'next-intl/server';

export default async function Page() {
  // !mark
  const t = await getTranslations('ServerComponentsPage');
  return <h1>{t('greeting')}</h1>;
}`;

const nonAsyncSample = `import {useTranslations} from 'next-intl';

export default function Page() {
  // !mark
  const t = useTranslations('ServerComponentsPage');
  return <h1>{t('greeting')}</h1>;
}`;

export default function ServerComponentsPage() {
  const t = useExtracted();

  return (
    <div className="pb-12">
      <header className="mb-6">
        <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-gray-600 uppercase dark:text-gray-300">
          {t('Translations')}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 sm:text-[28px] dark:text-gray-50">
          {t('Server Components')}
        </h1>
      </header>

      <Prose className="max-w-2xl">
        <p>
          {t(
            'Messages stay on the server, so no translation runtime is shipped to the client.'
          )}
        </p>

        <h3>{t('Async components')}</h3>
        <p>
          {t(
            'In async Server Components, await getTranslations to read messages.'
          )}
        </p>
        <Code value={asyncSample} label={t('Code')} />

        <h3>{t('Non-async components')}</h3>
        <p>
          {t(
            'In non-async Server Components, call useTranslations directly — no await needed.'
          )}
        </p>
        <Code value={nonAsyncSample} label={t('Code')} />
      </Prose>

      <PlaygroundBoundary
        label={t('Output')}
        variant="dotgrid"
        className="mt-8"
      >
        <div className="flex min-h-[140px] items-center justify-center">
          <ServerExample />
        </div>
      </PlaygroundBoundary>

      <div className="mt-6 flex justify-end">
        <GitHubLink path="examples/example-app-router-patterns/src/app/[locale]/translations/server-components" />
      </div>
    </div>
  );
}
