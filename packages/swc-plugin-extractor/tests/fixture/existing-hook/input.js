import {useExtracted, useTranslations} from 'next-intl';

function Component() {
  const t = useExtracted();
  const t2 = useTranslations();
  t("Hello from extracted!");
  t2("greeting");
}
