import {useExtracted} from 'next-intl';

function Component() {
  const t = useExtracted();
  t("Hey!");
}

const t = (msg) => msg;
t("Should not be transformed");
