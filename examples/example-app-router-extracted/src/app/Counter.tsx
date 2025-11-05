'use client';

import {useExtracted} from 'next-intl';
import {useState} from 'react';

export default function Client() {
  const [count, setCount] = useState(1000);
  const t = useExtracted();

  function onIncrement() {
    setCount(count + 1);
  }

  return (
    <>
      <p>{t('Count: {count, number}', {count})}</p>
      <button onClick={onIncrement}>{t('Increment')}</button>
    </>
  );
}
