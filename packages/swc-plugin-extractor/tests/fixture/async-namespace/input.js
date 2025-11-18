import {getExtracted} from 'next-intl/server';

async function Component() {
  const t = await getExtracted('ui');
  t("Hello!");
}
