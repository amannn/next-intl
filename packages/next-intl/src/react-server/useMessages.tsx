import type {useMessages as useMessagesType} from 'use-intl';
import {getMessagesFromConfig} from '../server/react-server/getMessages.js';
import useConfig from './useConfig.js';

export default function useMessages(): ReturnType<typeof useMessagesType> {
  const config = useConfig('useMessages');
  return getMessagesFromConfig(config);
}
