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
