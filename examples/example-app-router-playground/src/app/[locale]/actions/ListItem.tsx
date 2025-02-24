import {useTranslations} from 'next-intl';

export default function ListItem({id}: {id: number}) {
  const t = useTranslations('ServerActions');
  return t('item', {id: String(id)});
}
