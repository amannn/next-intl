import {getExtracted} from 'next-intl/server';

async function Component() {
  const translate = await getExtracted();
  translate("Hello there!");
}
