'use client';

import {useExtracted, useLocale} from 'next-intl';
import {useTransition} from 'react';
import {locales, type Locale} from '@/i18n/config';

const labels = {en: 'English', de: 'Deutsch'};

type Props = {
  changeLocaleAction: (locale: Locale) => Promise<void>;
};

export default function LocaleSwitcher({changeLocaleAction}: Props) {
  const locale = useLocale();
  const t = useExtracted();
  const [isPending, startTransition] = useTransition();

  return (
    <div
      aria-busy={isPending}
      aria-label={t('Language')}
      className="locale-switcher"
      role="group"
    >
      {locales.map((cur) => (
        <button
          key={cur}
          aria-pressed={locale === cur}
          disabled={isPending}
          onClick={() => startTransition(() => changeLocaleAction(cur))}
          type="button"
        >
          {labels[cur]}
        </button>
      ))}
    </div>
  );
}
