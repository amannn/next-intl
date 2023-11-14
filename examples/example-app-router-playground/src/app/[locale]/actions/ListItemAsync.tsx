import {getTranslations} from 'next-intl/server';

export default async function ListItemAsync({id}: {id: number}) {
  const t = await getTranslations('ServerActions');
  return t('item', {id});
}
