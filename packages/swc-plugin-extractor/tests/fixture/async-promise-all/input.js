import {getExtracted, getTranslations} from 'next-intl/server';
import getData from './getData';

async function Component() {
  const [t, nav, data] = await Promise.all([
    getExtracted(),
    getTranslations('Navigation'),
    getData()
  ]);
  t("Hello there!");
  nav('title');
  return data;
}
