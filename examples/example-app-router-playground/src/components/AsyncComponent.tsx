import {getTranslations} from 'next-intl/server';

export default async function AsyncComponent() {
  const t = await getTranslations('AsyncComponent');

  return (
    <div data-testid="AsyncComponent">
      <p>{t('basic')}</p>
      <p>{t.rich('rich', {important: (chunks) => <b>{chunks}</b>})}</p>
      <p>{t.markup('markup', {b: (chunks) => `<b>${chunks}</b>`})}</p>
    </div>
  );
}

export async function TypeTest() {
  const t = await getTranslations('AsyncComponent');

  // @ts-expect-error
  await getTranslations('Unknown');

  // @ts-expect-error
  t('unknown');
}
