import {useExtracted, useTranslations as useT} from 'next-intl';

function Component() {
  const t = useExtracted();
  const t2 = useT();
  t("Hello from extracted!");
  t2("greeting");
}
