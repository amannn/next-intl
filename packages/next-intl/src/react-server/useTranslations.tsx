import {useMemo} from 'react';
import createBaseTranslator, {
  getMessagesOrError
} from 'use-intl/dist/src/core/createBaseTranslator';
import useConfig from './useConfig';

export default function useTranslations(namespace?: string) {
  const config = useConfig();

  return useMemo(() => {
    const messagesOrError = getMessagesOrError({
      messages: config.messages as any,
      namespace,
      onError: config.onError
    });

    return createBaseTranslator({
      ...config,
      namespace,
      messagesOrError
    });
  }, [config, namespace]);
}
