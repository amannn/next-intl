'use client';

import {useTranslations} from 'next-intl';
import {useState} from 'react';

export default function Greeting() {
  const t = useTranslations('Greeting');
  const [name, setName] = useState('Frodo');
  return (
    <>
      <input
        aria-label={t('name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <p>{t('greeting', {name})}</p>
    </>
  );
}
