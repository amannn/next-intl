'use client';

import {useExtracted} from 'next-intl';
import {useState} from 'react';

export function ClientExample() {
  const t = useExtracted();
  const [name, setName] = useState('');

  return (
    <div className="space-y-3">
      <label
        htmlFor="client-example-name"
        className="block text-sm font-medium text-gray-600 dark:text-gray-300"
      >
        {t('Your name')}
      </label>
      <input
        id="client-example-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('Frodo')}
        className="w-full max-w-xs rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
      />
      <p className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
        {t('Hello, {name}!', {name: name || t('Frodo')})}
      </p>
    </div>
  );
}
