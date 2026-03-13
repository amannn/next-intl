import {useExtracted} from 'next-intl';

function Component() {
  const t = useExtracted();
  t("Hello!");
  t('Hey!');
  t(`Hi!`);
}
