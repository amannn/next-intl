'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function ClientExample() {
  const t = useTranslations('ClientDemo');
  const [name, setName] = useState('');

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-muted-foreground">
        {t('label')}
      </label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('placeholder')}
        className="w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm"
      />
      <p className="text-2xl font-semibold text-foreground">
        {t('greeting', { name: name || t('placeholder') })}
      </p>
    </div>
  );
}
