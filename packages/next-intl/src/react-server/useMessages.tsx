import type {useMessages as useMessagesType} from 'use-intl';
import {getMessagesFromConfig} from '../runtimes/react-server';
import useConfig from './useConfig';

export default function useMessages(
  // eslint-disable-next-line no-empty-pattern
  ...[]: Parameters<typeof useMessagesType>
): ReturnType<typeof useMessagesType> {
  const config = useConfig('useMessages');
  return getMessagesFromConfig(config);
}
