import createBaseTranslator, {
  getMessagesOrError
} from 'use-intl/dist/src/core/createBaseTranslator';
import NextIntlRequestStorage from '../server/NextIntlRequestStorage';

export default function useTranslations(namespace?: string) {
  const opts = NextIntlRequestStorage.getIntlOpts();
  const messagesOrError = getMessagesOrError({
    messages: opts.messages as any,
    namespace,
    onError: opts.onError
  });
  return createBaseTranslator({
    ...opts,
    namespace,
    messagesOrError
  });
}
