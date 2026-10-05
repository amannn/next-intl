import {useExtracted, useTranslations} from 'next-intl';

function Component() {
  const e = useExtracted();
  const t = useTranslations('Namespace');

  e('Hello!');
  t('title');

  e({
    message: 'Book',
    description: 'Label in navigation menu for reading materials'
  });
  e({
    message: 'Book',
    description: 'Action button in checkout flow to complete reservation'
  });
}
