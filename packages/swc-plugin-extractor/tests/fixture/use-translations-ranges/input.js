import {useTranslations} from 'next-intl';

function Component({kind}) {
  const t = useTranslations('Pöll');

  // Two calls on one line: the line alone can't tell them apart.
  const vote = [t('yes'), t('no')];

  // The argument range covers the key however it's written.
  t(`template`);
  t.rich('rich', {b: (chunks) => <b>{chunks}</b>});
  t(
    'wrapped'
  );

  // A dynamic key resolves to the namespace; the range covers the expression.
  t(`item.${kind}`);

  return vote;
}
