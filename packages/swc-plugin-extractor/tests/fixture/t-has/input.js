import {useExtracted} from 'next-intl';

function Component() {
  const t = useExtracted();
  if (t.has('Hello here!')) {
    return t('Hello here!');
  } else {
    return t('Hello there!');
  }
}
