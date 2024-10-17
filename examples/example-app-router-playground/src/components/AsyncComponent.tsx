import {getFormatter, getTranslations} from 'next-intl/server';

export default async function AsyncComponent() {
  const t = await getTranslations('AsyncComponent');

  return (
    <div data-testid="AsyncComponent">
      <p>{t('basic')}</p>
      <p>{t.rich('rich', {important: (chunks) => <b>{chunks}</b>})}</p>
      <p>{t.markup('markup', {b: (chunks) => `<b>${chunks}</b>`})}</p>
      <p>{String(t.has('basic'))}</p>
    </div>
  );
}

export async function TypeTest() {
  const t = await getTranslations('AsyncComponent');

  const format = await getFormatter();

  // @ts-expect-error
  await getTranslations('Unknown');

  // @ts-expect-error
  t('unknown');

  // @ts-expect-error
  t.rich('unknown');

  // @ts-expect-error
  t.markup('unknown');

  // @ts-expect-error
  t.has('unknown');

  format.dateTime(new Date(), 'medium');
  // @ts-expect-error
  format.dateTime(new Date(), 'unknown');

  format.dateTimeRange(new Date(), new Date(), 'medium');
  // @ts-expect-error
  format.dateTimeRange(new Date(), new Date(), 'unknown');

  format.number(420, 'precise');
  // @ts-expect-error
  format.number(420, 'unknown');

  format.list(['this', 'is', 'a', 'list'], 'enumeration');
  // @ts-expect-error
  format.list(['this', 'is', 'a', 'list'], 'unknown');
}
