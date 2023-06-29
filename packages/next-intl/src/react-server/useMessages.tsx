import type {useMessages as useMessagesType} from 'use-intl';
import getMessages from '../server/getMessages';
import useHook from './useHook';
import useLocale from './useLocale';

export default function useMessages(
  // eslint-disable-next-line no-empty-pattern
  ...[]: Parameters<typeof useMessagesType>
): ReturnType<typeof useMessagesType> {
  const locale = useLocale();
  return useHook('useMessages', getMessages(locale));
}
