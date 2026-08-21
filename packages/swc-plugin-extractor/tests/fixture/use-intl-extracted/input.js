import {useExtracted} from 'use-intl';

function Component() {
  const t = useExtracted();
  t('Hey!');
}
