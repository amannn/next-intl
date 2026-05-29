'use client';

import {useTranslations} from 'next-intl';
import {useState} from 'react';

export function ClientExample() {
  const t = useTranslations('ClientComponentsPage');
  const [name, setName] = useState('');

  return (
    <div className="space-y-3">
      <label
        htmlFor="client-example-name"
        className="text-muted-foreground block text-sm font-medium"
      >
        {t('label')}
      </label>
      <input
        id="client-example-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('placeholder')}
        className="border-border bg-background w-full max-w-xs rounded-md border px-3 py-2 text-sm"
      />
      <p className="text-foreground text-2xl font-semibold">
        {t('greeting', {name: name || t('placeholder')})}
      </p>
    </div>
  );
}
