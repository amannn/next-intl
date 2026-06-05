import {useExtracted, useTranslations} from 'next-intl';

function Component() {
  const e = useExtracted();
  const t = useTranslations('Namespace');

  e('Hello!');
  t('title');
}
