import createBaseTranslator, {
  getMessagesOrError
} from 'use-intl/dist/src/core/createBaseTranslator';
import useConfig from './useConfig';

export default function useTranslations(namespace?: string) {
  const config = useConfig();

  const messagesOrError = getMessagesOrError({
    messages: config.messages as any,
    namespace,
    onError: config.onError
  });

  // TODO: We could cache this
  return createBaseTranslator({
    ...config,
    namespace,
    messagesOrError
  });
}
