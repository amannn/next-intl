'use client';

import {useExtracted} from 'next-intl';
import {useState} from 'react';
import ClientBoundary from '@/components/ClientBoundary';

export default function Counter() {
  const [count, setCount] = useState(1000);
  const t = useExtracted();

  function onIncrement() {
    setCount(count + 1);
  }

  return (
    <ClientBoundary>
      <p>{t('Count: {count, number}', {count})}</p>
      <button
        className="border border-gray-300 rounded-md px-2 py-1"
        onClick={onIncrement}
      >
        {t('Increment')}
      </button>
    </ClientBoundary>
  );
}
