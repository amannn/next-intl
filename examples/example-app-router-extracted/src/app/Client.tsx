'use client';

import {useExtracted} from 'next-intl';

export default function Client() {
  const t = useExtracted();
  return (
    <>
      <p>{t('Hey from client!')}</p>
    </>
  );
}
