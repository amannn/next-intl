'use client';

import {useExtracted} from 'next-intl';

export default function Client() {
  const t = useExtracted();
  return (
    <>
      <p>{t('Hey from client!')}</p>
      <p>
        {t.rich('This is a <b>bold</b> message', {
          b: (chunks) => <b>{chunks}</b>
        })}
      </p>
      <p>
        {t.markup('This is a <b>bold</b> message', {
          b: (chunks) => `<b>${chunks}</b>`
        })}
      </p>
      <p>{t.has('How are you?') ? t('How are you?') : 'N/A'}</p>
    </>
  );
}
