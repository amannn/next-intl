import type {useMessages as useMessagesType} from 'use-intl';
import {getMessagesFromConfig} from '../server/react-server/getMessages.tsx';
import useConfig from './useConfig.tsx';

export default function useMessages(): ReturnType<typeof useMessagesType> {
  const config = useConfig('useMessages');
  return getMessagesFromConfig(config);
}
