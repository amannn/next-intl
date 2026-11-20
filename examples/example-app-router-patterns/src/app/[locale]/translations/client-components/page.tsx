import {Code} from '@/components/Code';
import {GitHubLink} from '@/components/GitHubLink';
import {PlaygroundBoundary} from '@/components/PlaygroundBoundary';
import {Prose} from '@/components/Prose';
import {useExtracted} from 'next-intl';
import {ClientExample} from './ClientExample';

const sample = `'use client';
import {useState} from 'react';
import {useTranslations} from 'next-intl';

export function Greet() {
  // !mark
  const t = useTranslations('ClientComponentsPage');
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
    <div className="pb-12">
      <header className="mb-6">
        <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-gray-600 uppercase dark:text-gray-300">
          {t('Translations')}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900 sm:text-[28px] dark:text-gray-50">
          {t('Client Components')}
        </h1>
      </header>

      <Prose className="max-w-2xl">
        <ul>
          <li>
            {t.rich(
              '<code>useTranslations</code> can be called in Client Components to incorporate client-side state.',
              {code: (chunks) => <code>{chunks}</code>}
            )}
          </li>
          <li>
            {t.rich(
              "ICU arguments like <code>'{name}'</code> are resolved in the browser as state changes.",
              {code: (chunks) => <code>{chunks}</code>}
            )}
          </li>
        </ul>
        <Code value={sample} label={t('Code')} />
      </Prose>

      <PlaygroundBoundary
        label={t('Output')}
        variant="dotgrid"
        className="mt-8"
      >
        <div className="flex min-h-[180px] items-center justify-center">
          <ClientExample />
        </div>
      </PlaygroundBoundary>

      <div className="mt-6 flex justify-end">
        <GitHubLink path="src/app/[locale]/translations/client-components" />
      </div>
    </div>
  );
}
