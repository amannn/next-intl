import Code from '@/components/Code';
import GitHubLink from '@/components/GitHubLink';
import PlaygroundBoundary from '@/components/PlaygroundBoundary';
import Prose from '@/components/Prose';
import {docsUrl} from '@/config';
import {useExtracted} from 'next-intl';
import Greeting from './Greeting';

const sample = `'use client';
import {useState} from 'react';
import {useTranslations} from 'next-intl';

export default function Greeting() {
  // !mark
  const t = useTranslations('Greeting');
  const [name, setName] = useState('Frodo');
  return (
    <>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <p>{t('greeting', {name})}</p>
    </>
  );
}`;

export default function ClientComponentsPage() {
  const t = useExtracted();

  return (
    <div>
      <header className="mb-6">
        <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-gray-600 uppercase dark:text-gray-300">
          {t('Translations')}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 sm:text-[28px] dark:text-gray-50">
          {t('Client Components')}
        </h1>
      </header>

      <Prose>
        <p>
          {t.rich(
            'In Client Components, <code>useTranslations</code> can format messages with client-side state, like the name below.',
            {
              code: (chunks) => (
                <a
                  href={`${docsUrl}/environments/server-client-components#using-internationalization-in-client-components`}
                >
                  <code>{chunks}</code>
                </a>
              )
            }
          )}
        </p>
        <Code value={sample} label={t('Code')} />
        <PlaygroundBoundary label={t('Output')} variant="dotgrid">
          <Greeting />
        </PlaygroundBoundary>
      </Prose>

      <div className="mt-6 flex justify-end">
        <GitHubLink path="src/app/[locale]/translations/client-components" />
      </div>
    </div>
  );
}
