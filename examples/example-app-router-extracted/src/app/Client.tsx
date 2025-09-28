'use client';

import {useExtracted} from 'next-intl';

export default function Client() {
  const t = useExtracted();
  return (
    <>
      <h1>{t('Hey from client!')}</h1>
    </>
  );
}
