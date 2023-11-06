import {getTranslator} from 'next-intl/server';

type Props = {
  locale: string;
};

export default async function AsyncComponent({locale}: Props) {
  const t = await getTranslator({locale, namespace: 'AsyncComponent'});

  return (
    <div data-testid="AsyncComponent">
      <p>{t('basic')}</p>
      <p>{t.rich('rich', {important: (chunks) => <b>{chunks}</b>})}</p>
      <p>{t.markup('markup', {b: (chunks) => `<b>${chunks}</b>`})}</p>
    </div>
  );
}
