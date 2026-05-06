'use client';

import {useLocale} from 'next-intl';

export default function LocaleSwitcher({
  setLocaleAction
}: {
  setLocaleAction: (locale: string) => Promise<void>;
}) {
  const locale = useLocale();

  return (
    <div className="flex gap-2 py-2">
      <button
        className="disabled:underline"
        disabled={locale === 'en'}
        onClick={() => setLocaleAction('en')}
      >
        EN
      </button>
      <button
        className="disabled:underline"
        disabled={locale === 'de'}
        onClick={() => setLocaleAction('de')}
      >
        DE
      </button>
    </div>
  );
}
